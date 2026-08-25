// Polyfill Symbol.metadata for @colyseus/schema compatibility
(Symbol as any).metadata ??= Symbol('metadata');

import http from 'http';
import path from 'path';
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

// ─── Serve the built Vite client in production ───
// In production (Render), the client is pre-built into ../client/dist
// relative to the server's dist/ output directory.
const clientDistPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

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
  res.sendFile(path.join(clientDistPath, 'index.html'));
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

