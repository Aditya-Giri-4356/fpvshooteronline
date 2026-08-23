/**
 * Shared Type Definitions for the 3D Multiplayer FPS.
 */

export type RoomStatus = 'LOBBY' | 'STARTING' | 'PLAYING' | 'ENDED';

export type ThemeType = 'DESERT_OUTPOST' | 'CYBER_METROPOLIS' | 'SCENIC_VALLEY' | 'INDUSTRIAL_DOCKS';

export type CharacterClass = 'VANGUARD' | 'PHANTOM' | 'JUGGERNAUT' | 'SPECTRE';

export interface IPlayer {
  id: string;              // Client session ID
  name: string;            // Ephemeral player display name
  isHost: boolean;         // Host of the room
  ready: boolean;          // Ready status in lobby
  characterClass: CharacterClass; // Operative class selection
  x: number;               // 3D X position
  y: number;               // 3D Y position
  z: number;               // 3D Z position
  rotX: number;            // Pitch angle (radians)
  rotY: number;            // Yaw angle (radians)
  colorIndex: number;      // Player avatar accent color index
  ping: number;            // Network ping
  health: number;          // Current health (0 - 100)
  maxHealth: number;       // Max health (100)
  kills: number;           // Kills count
  deaths: number;          // Deaths count
  isDead: boolean;         // Dead / respawning state
  isShielded: boolean;     // Invulnerable spawn shield
  lastShotTime: number;    // Timestamp of last shot for muzzle flash
}

export interface IRoomState {
  roomCode: string;
  hostSessionId: string;
  status: RoomStatus;
  maxPlayers: number;
  players: Record<string, IPlayer>;
  mapName: string;
  selectedTheme: ThemeType;
  createdAt: number;
}

// Client to Server Message Payloads
export interface MovePayload {
  x: number;
  y: number;
  z: number;
  rotX: number;
  rotY: number;
}

export interface ShootPayload {
  originX: number;
  originY: number;
  originZ: number;
  dirX: number;
  dirY: number;
  dirZ: number;
  targetSessionId?: string;
  isHeadshot?: boolean;
  hitX?: number;
  hitY?: number;
  hitZ?: number;
}

export interface HitPayload {
  targetSessionId: string;
  isHeadshot: boolean;
  damage: number;
}

export interface KillFeedItem {
  id: string;
  attackerId: string;
  attackerName: string;
  victimId: string;
  victimName: string;
  isHeadshot: boolean;
  timestamp: number;
}

export interface JoinRoomOptions {
  roomCode?: string;
  playerName: string;
  characterClass?: CharacterClass;
  isHost?: boolean;
}

export interface CreateRoomOptions {
  playerName: string;
  characterClass?: CharacterClass;
  selectedTheme?: ThemeType;
}

// Server to Client Message Names
export enum NetworkMessages {
  START_GAME = 'START_GAME',
  SELECT_THEME = 'SELECT_THEME',
  SELECT_CHARACTER = 'SELECT_CHARACTER',
  PLAYER_MOVE = 'PLAYER_MOVE',
  PLAYER_SHOOT = 'PLAYER_SHOOT',
  PLAYER_HIT = 'PLAYER_HIT',
  PLAYER_DIED = 'PLAYER_DIED',
  PLAYER_RESPAWN = 'PLAYER_RESPAWN',
  KILL_FEED = 'KILL_FEED',
  DAMAGE_TAKEN = 'DAMAGE_TAKEN',
  PING = 'PING',
  PONG = 'PONG',
  ROOM_ERROR = 'ROOM_ERROR'
}

// HTTP API Types
export interface ValidateRoomResponse {
  exists: boolean;
  roomCode?: string;
  playerCount?: number;
  maxPlayers?: number;
  status?: RoomStatus;
  selectedTheme?: ThemeType;
  error?: string;
}
