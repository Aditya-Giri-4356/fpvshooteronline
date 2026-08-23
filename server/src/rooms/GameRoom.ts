import { Room, Client } from 'colyseus';
import { GameState } from './schema/GameState';
import { PlayerSchema } from './schema/PlayerSchema';
import { generateUniqueRoomCode, releaseRoomCode } from '../utils/roomCode';
import { 
  JoinRoomOptions, 
  MovePayload, 
  ShootPayload,
  KillFeedItem,
  MAX_PLAYERS_PER_ROOM, 
  MAX_NAME_LENGTH, 
  DEFAULT_PLAYER_NAME,
  MAX_PLAYER_HEALTH,
  WEAPON_BODY_DAMAGE,
  WEAPON_HEADSHOT_DAMAGE,
  SPAWN_SHIELD_DURATION_MS,
  NetworkMessages 
} from '@fps/shared';

// Spawn positions around the map
const SPAWN_POINTS = [
  { x: 0, z: 0 },
  { x: 12, z: -10 },
  { x: -12, z: 10 },
  { x: 18, z: 15 },
  { x: -18, z: -15 },
  { x: 22, z: -8 },
  { x: -20, z: 18 },
  { x: 0, z: 22 },
];

export class GameRoom extends Room<{ state: GameState; metadata: { roomCode: string } }> {
  maxClients = MAX_PLAYERS_PER_ROOM;
  autoDispose = true;

  onCreate(options: JoinRoomOptions) {
    let roomCode = options && options.roomCode ? options.roomCode.trim().toUpperCase() : '';
    if (!roomCode) {
      roomCode = generateUniqueRoomCode();
    }

    this.setState(new GameState(roomCode));
    this.setMetadata({ roomCode });

    console.log(`[GameRoom] Room created with code: ${roomCode} (Room ID: ${this.roomId})`);

    // Handle "START_GAME" from the Host
    this.onMessage(NetworkMessages.START_GAME, (client) => {
      if (client.sessionId !== this.state.hostSessionId) {
        console.warn(`[GameRoom] Non-host client ${client.sessionId} attempted to start game.`);
        client.send(NetworkMessages.ROOM_ERROR, { message: 'Only the room host can start the game.' });
        return;
      }

      if (this.state.status !== 'LOBBY') return;

      console.log(`[GameRoom] Host started match for room ${this.state.roomCode}`);
      this.state.status = 'PLAYING';

      // Grant spawn shield on match start
      this.state.players.forEach((player) => {
        player.isShielded = true;
        this.clock.setTimeout(() => {
          player.isShielded = false;
        }, SPAWN_SHIELD_DURATION_MS);
      });

      this.broadcast(NetworkMessages.START_GAME, { startedAt: Date.now() });
    });

    // Handle "PLAYER_MOVE"
    this.onMessage(NetworkMessages.PLAYER_MOVE, (client, data: MovePayload) => {
      const player = this.state.players.get(client.sessionId);
      if (!player || player.isDead) return;

      if (typeof data.x === 'number' && typeof data.y === 'number' && typeof data.z === 'number') {
        player.x = data.x;
        player.y = data.y;
        player.z = data.z;
        player.rotX = data.rotX || 0;
        player.rotY = data.rotY || 0;
      }
    });

    // Handle "PLAYER_SHOOT" (Combat Shooting & Hit Registration)
    this.onMessage(NetworkMessages.PLAYER_SHOOT, (client, data: ShootPayload) => {
      const shooter = this.state.players.get(client.sessionId);
      if (!shooter || shooter.isDead) return;

      shooter.lastShotTime = Date.now();

      // Broadcast shot event to all other players (for bullet tracer & muzzle flash rendering)
      this.broadcast(
        NetworkMessages.PLAYER_SHOOT,
        {
          shooterSessionId: client.sessionId,
          originX: data.originX,
          originY: data.originY,
          originZ: data.originZ,
          dirX: data.dirX,
          dirY: data.dirY,
          dirZ: data.dirZ,
          hitX: data.hitX,
          hitY: data.hitY,
          hitZ: data.hitZ,
        },
        { except: client }
      );

      // Process damage if target was hit
      if (data.targetSessionId) {
        const target = this.state.players.get(data.targetSessionId);
        if (target && !target.isDead && !target.isShielded && target.id !== client.sessionId) {
          const isHeadshot = !!data.isHeadshot;
          const damage = isHeadshot ? WEAPON_HEADSHOT_DAMAGE : WEAPON_BODY_DAMAGE;

          target.health = Math.max(0, target.health - damage);

          // Confirm hit to shooter (for hitmarker & floating damage number)
          client.send(NetworkMessages.PLAYER_HIT, {
            targetSessionId: target.id,
            damage,
            isHeadshot,
            hitX: data.hitX || target.x,
            hitY: data.hitY || target.y + 1.2,
            hitZ: data.hitZ || target.z,
          });

          // Notify victim of damage taken
          const targetClient = this.clients.find((c) => c.sessionId === target.id);
          if (targetClient) {
            targetClient.send(NetworkMessages.DAMAGE_TAKEN, {
              attackerSessionId: client.sessionId,
              attackerName: shooter.name,
              damage,
              newHealth: target.health,
            });
          }

          // Check for Elimination
          if (target.health === 0) {
            target.isDead = true;
            target.deaths += 1;
            shooter.kills += 1;

            const killItem: KillFeedItem = {
              id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              attackerId: client.sessionId,
              attackerName: shooter.name,
              victimId: target.id,
              victimName: target.name,
              isHeadshot,
              timestamp: Date.now(),
            };

            this.broadcast(NetworkMessages.KILL_FEED, killItem);
            this.broadcast(NetworkMessages.PLAYER_DIED, {
              victimSessionId: target.id,
              attackerSessionId: client.sessionId,
              isHeadshot,
            });

            console.log(`[GameRoom] ⚡ Kill: '${shooter.name}' eliminated '${target.name}' (Headshot: ${isHeadshot})`);
          }
        }
      }
    });

    // Handle "PLAYER_RESPAWN"
    this.onMessage(NetworkMessages.PLAYER_RESPAWN, (client) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      // Pick random spawn point
      const spawnIndex = Math.floor(Math.random() * SPAWN_POINTS.length);
      const spawn = SPAWN_POINTS[spawnIndex];

      player.health = MAX_PLAYER_HEALTH;
      player.isDead = false;
      player.isShielded = true;
      player.x = spawn.x + (Math.random() * 2 - 1);
      player.y = 1.0;
      player.z = spawn.z + (Math.random() * 2 - 1);

      // Remove shield after duration
      this.clock.setTimeout(() => {
        player.isShielded = false;
      }, SPAWN_SHIELD_DURATION_MS);

      client.send(NetworkMessages.PLAYER_RESPAWN, {
        x: player.x,
        y: player.y,
        z: player.z,
      });

      console.log(`[GameRoom] Player '${player.name}' respawned at (${player.x.toFixed(1)}, ${player.z.toFixed(1)})`);
    });

    // Handle ping for latency measurement
    this.onMessage(NetworkMessages.PING, (client, timestamp: number) => {
      client.send(NetworkMessages.PONG, timestamp);
    });
  }

  onJoin(client: Client, options: JoinRoomOptions) {
    const rawName = (options && options.playerName ? options.playerName : '').trim();
    const cleanName = rawName.slice(0, MAX_NAME_LENGTH) || `${DEFAULT_PLAYER_NAME}-${Math.floor(100 + Math.random() * 900)}`;

    const isFirstPlayer = this.state.players.size === 0;
    const isHost = isFirstPlayer || options?.isHost === true;

    if (isFirstPlayer) {
      this.state.hostSessionId = client.sessionId;
    }

    const playerCount = this.state.players.size;
    const spawnIndex = playerCount % SPAWN_POINTS.length;
    const spawnPos = SPAWN_POINTS[spawnIndex];

    const player = new PlayerSchema(
      client.sessionId,
      cleanName,
      isHost,
      playerCount % 8
    );

    // Initial spawn coordinates
    player.x = spawnPos.x;
    player.y = 1.0;
    player.z = spawnPos.z;
    player.health = MAX_PLAYER_HEALTH;
    player.maxHealth = MAX_PLAYER_HEALTH;
    player.isDead = false;
    player.isShielded = true;

    this.clock.setTimeout(() => {
      player.isShielded = false;
    }, SPAWN_SHIELD_DURATION_MS);

    this.state.players.set(client.sessionId, player);

    console.log(`[GameRoom] Player '${cleanName}' (${client.sessionId}) joined room ${this.state.roomCode} [Host: ${isHost}]`);
  }

  onLeave(client: Client, code?: number) {
    const player = this.state.players.get(client.sessionId);
    const playerName = player ? player.name : client.sessionId;
    const wasHost = player ? player.isHost : false;

    this.state.players.delete(client.sessionId);
    console.log(`[GameRoom] Player '${playerName}' left room ${this.state.roomCode} (code: ${code}). Remaining: ${this.state.players.size}`);

    // Migrate host if needed
    if (wasHost && this.state.players.size > 0) {
      const nextHostSessionId = this.state.players.keys().next().value;
      if (nextHostSessionId) {
        this.state.hostSessionId = nextHostSessionId;
        const newHost = this.state.players.get(nextHostSessionId);
        if (newHost) {
          newHost.isHost = true;
          console.log(`[GameRoom] Host migrated to '${newHost.name}' (${nextHostSessionId})`);
        }
      }
    }
  }

  onDispose() {
    console.log(`[GameRoom] Disposing empty room ${this.state.roomCode}`);
    if (this.state.roomCode) {
      releaseRoomCode(this.state.roomCode);
    }
  }
}
