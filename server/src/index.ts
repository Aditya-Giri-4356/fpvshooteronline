import http from 'http';
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server, matchMaker } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { GameRoom } from './rooms/GameRoom';
import { activeRoomCodes, isValidRoomCode } from './utils/roomCode';

dotenv.config();

const PORT = Number(process.env.PORT || 2567);
const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
}));
app.use(express.json());

// Express Matchmaker Route for Colyseus Client Compatibility (Supports Colyseus 0.15, 0.16, 0.17)
app.post('/matchmake/:method/:roomName?', async (req: Request, res: Response) => {
  const method = req.params.method as any;
  const roomNameParam = Array.isArray(req.params.roomName) ? req.params.roomName[0] : req.params.roomName;
  const roomName = roomNameParam || req.body?.roomName || 'game_room';
  const clientOptions = req.body || {};

  try {
    const result = await matchMaker.controller.invokeMethod(method, roomName, clientOptions);
    // Return both top-level and nested .room fields for 100% client version compatibility
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

// Root informative endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'FPS Multiplayer Server',
    version: '1.0.0',
    status: 'running',
    health: '/health',
    activeRooms: activeRoomCodes.size,
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

// Start listening
httpServer.listen(PORT, () => {
  console.log(`\n=================================================`);
  console.log(`  🎯 FPS Multiplayer Server running`);
  console.log(`  🌐 HTTP & WebSocket Port: ${PORT}`);
  console.log(`  🩺 Health Check: http://localhost:${PORT}/health`);
  console.log(`  🎮 Room Handler: 'game_room' (filterBy: roomCode)`);
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
