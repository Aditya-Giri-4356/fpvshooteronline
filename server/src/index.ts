// Polyfill Symbol.metadata for @colyseus/schema compatibility
(Symbol as any).metadata ??= Symbol('metadata');

import http from 'http';
import path from 'path';
import fs from 'fs';
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server, matchMaker } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { GameRoom } from './rooms/GameRoom';
import { activeRoomCodes, isValidRoomCode } from './utils/roomCode';

dotenv.config();

const PORT = Number(process.env.PORT || 2567);
const HOST = '0.0.0.0';
const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
}));
app.use(express.json());

// ─── Resolve the built Vite client in production ───
function getClientDistPath(): string {
  const candidatePaths = [
    path.resolve(__dirname, '../../client/dist'),
    path.resolve(__dirname, '../client/dist'),
    path.resolve(process.cwd(), 'client/dist'),
    path.resolve(process.cwd(), '../client/dist'),
  ];
  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate) && fs.existsSync(path.join(candidate, 'index.html'))) {
      return candidate;
    }
  }
  // Default to standard monorepo relative path
  return candidatePaths[0];
}

const clientDistPath = getClientDistPath();
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

// Express Matchmaker Route for Colyseus Client Compatibility
app.post('/matchmake/:method/:roomName?', async (req: Request, res: Response) => {
  const method = req.params.method as any;
  const roomNameParam = Array.isArray(req.params.roomName) ? req.params.roomName[0] : req.params.roomName;
  const roomName = roomNameParam || req.body?.roomName || 'game_room';
  const clientOptions = req.body || {};

  try {
    const result = await matchMaker.controller.invokeMethod(method, roomName, clientOptions);
    return res.status(200).json({
      room: result,
      ...result,
    });
  } catch (err: any) {
    console.error(`[MatchMaker] Error invoking ${method}:`, err.message);
    return res.status(err.code || 500).json({
      error: err.message,
      code: err.code,
    });
  }
});

// Lightweight ping endpoint for keep-alive bots & client pre-warming
app.get('/ping', (_req: Request, res: Response) => {
  res.status(200).send('pong');
});

// Health check endpoint (essential for Render / container health checks)
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    activeRoomCount: activeRoomCodes.size,
  });
});

// Room validation endpoint - check if a room code exists and is accessible
app.get('/api/rooms/:code', async (req: Request, res: Response) => {
  const codeParam = Array.isArray(req.params.code) ? req.params.code[0] : req.params.code;
  const code = (codeParam || '').trim().toUpperCase();

  if (!isValidRoomCode(code)) {
    return res.status(400).json({
      exists: false,
      error: 'Invalid room code format. Must be 6 alphanumeric characters.',
    });
  }

  try {
    const rooms = await matchMaker.query({ name: 'game_room' });
    const matchingRoom = rooms.find(
      (r) => r.metadata && r.metadata.roomCode === code
    );

    if (!matchingRoom) {
      return res.status(404).json({
        exists: false,
        error: `Room '${code}' does not exist or has expired.`,
      });
    }

    if (matchingRoom.locked || (matchingRoom.clients >= matchingRoom.maxClients)) {
      return res.status(403).json({
        exists: true,
        roomCode: code,
        playerCount: matchingRoom.clients,
        maxPlayers: matchingRoom.maxClients,
        error: 'Room is full.',
      });
    }

    return res.status(200).json({
      exists: true,
      roomCode: code,
      playerCount: matchingRoom.clients,
      maxPlayers: matchingRoom.maxClients,
    });
  } catch (err: any) {
    console.error('[API] Error querying room:', err);
    return res.status(500).json({
      exists: false,
      error: 'Failed to query room status.',
    });
  }
});

// ─── SPA Catch-All: serve index.html for any non-API route ───
// This MUST come after all API routes so /ping, /health, /api/* still work.
app.get('*', (_req: Request, res: Response) => {
  const activeDistPath = getClientDistPath();
  const indexPath = path.join(activeDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath, (err) => {
      if (err && !res.headersSent) {
        res.status(500).send('Error delivering game client.');
      }
    });
  }

  // Graceful fallback status UI if client assets have not been built yet
  return res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>FPS Multiplayer Server</title>
      <style>
        body { background: #0b0f19; color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .card { background: #131b2e; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px; max-width: 480px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
        h1 { color: #38bdf8; margin: 0 0 12px 0; font-size: 24px; }
        p { color: #94a3b8; font-size: 14px; line-height: 1.5; margin: 8px 0; }
        .badge { display: inline-block; background: #065f46; color: #34d399; font-size: 12px; padding: 4px 12px; border-radius: 9999px; font-weight: 600; margin-bottom: 16px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="badge">SERVER ONLINE</div>
        <h1>FPS Multiplayer Engine</h1>
        <p>Backend WebSocket Matchmaker is live and healthy.</p>
        <p style="font-size: 12px; color: #64748b;">Client build assets will appear automatically once deployed.</p>
      </div>
    </body>
    </html>
  `);
});

// Create HTTP server
const httpServer = http.createServer(app);

// Attach Colyseus Game Server with WebSocket Transport
const gameServer = new Server({
  transport: new WebSocketTransport({
    server: httpServer,
  }),
});

// Register the GameRoom with filterBy: 'roomCode'
gameServer
  .define('game_room', GameRoom)
  .filterBy(['roomCode']);

// Start listening explicitly on 0.0.0.0 for containerized environments
httpServer.listen(PORT, HOST, () => {
  console.log(`\n=================================================`);
  console.log(`  🎯 FPS Multiplayer Server (AIO) running`);
  console.log(`  🌐 Game + API + WebSocket: http://${HOST}:${PORT}`);
  console.log(`  🩺 Health Check: http://${HOST}:${PORT}/health`);
  console.log(`  🎮 Room Handler: 'game_room' (filterBy: roomCode)`);
  console.log(`  📁 Serving client from: ${clientDistPath}`);
  console.log(`=================================================\n`);

  // Automatic Self-Ping Keep-Alive Loop for Render
  const externalUrl = process.env.RENDER_EXTERNAL_URL || process.env.SERVER_URL;
  if (externalUrl) {
    const keepAliveUrl = `${externalUrl.replace(/\/$/, '')}/ping`;
    console.log(`[KeepAlive] Initiating self-ping loop targeting ${keepAliveUrl} every 8 minutes.`);
    
    setInterval(async () => {
      try {
        const res = await fetch(keepAliveUrl);
        console.log(`[KeepAlive] Self-ping status: ${res.status} (${new Date().toLocaleTimeString()})`);
      } catch (err: any) {
        console.warn(`[KeepAlive] Self-ping notice:`, err.message);
      }
    }, 8 * 60 * 1000);
  }
});

// Graceful shutdown handling
const handleShutdown = () => {
  console.log('[Server] Gracefully shutting down...');
  gameServer.gracefullyShutdown().then(() => {
    process.exit(0);
  });
};

process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);

