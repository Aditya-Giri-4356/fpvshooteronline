/**
 * Game constants shared between client and server.
 */

// Room Code configuration
// Avoiding ambiguous characters like 0/O, 1/I, 8/B to ensure easy readability
export const ROOM_CODE_CHARACTERS = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
export const ROOM_CODE_LENGTH = 6;

// Room Limits
export const MAX_PLAYERS_PER_ROOM = 8;
export const MIN_PLAYERS_TO_START = 1;

// Player Constraints
export const MAX_NAME_LENGTH = 16;
export const DEFAULT_PLAYER_NAME = 'Operator';

// Gameplay & Physics Constants
export const PLAYER_HEIGHT = 1.8;
export const PLAYER_RADIUS = 0.4;
export const PLAYER_WALK_SPEED = 7.0;
export const PLAYER_SPRINT_SPEED = 11.0;
export const PLAYER_JUMP_FORCE = 6.5;
export const GRAVITY = -18.0;

// Combat & Weapon Constants
export const MAX_PLAYER_HEALTH = 100;
export const WEAPON_FIRE_RATE_MS = 120; // ~8.3 shots per second (fast arcade feel)
export const WEAPON_BODY_DAMAGE = 25;   // 4 body shots to eliminate
export const WEAPON_HEADSHOT_DAMAGE = 50; // 2 headshots to eliminate
export const WEAPON_MAX_RANGE = 200;    // meters
export const RESPAWN_TIME_SECONDS = 3;  // seconds to respawn
export const SPAWN_SHIELD_DURATION_MS = 2000; // 2 seconds invulnerability

// Network tick rates
export const SERVER_PATCH_RATE_MS = 50; // 20 updates per second
export const CLIENT_POSITION_SEND_RATE_MS = 50; // 20 updates per second

/**
 * Generates a clean 6-character uppercase readable room code.
 */
export function generateRoomCode(): string {
  let code = '';
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * ROOM_CODE_CHARACTERS.length);
    code += ROOM_CODE_CHARACTERS[randomIndex];
  }
  return code;
}
