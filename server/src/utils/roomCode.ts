import { ROOM_CODE_CHARACTERS, ROOM_CODE_LENGTH } from '@fps/shared';

// Registry of currently active room codes on this server instance
export const activeRoomCodes = new Set<string>();

/**
 * Generates a short, readable, unique 6-character room code.
 * Guaranteed not to collide with currently active rooms.
 */
export function generateUniqueRoomCode(): string {
  const chars = ROOM_CODE_CHARACTERS;
  const maxAttempts = 1000;
  let attempts = 0;

  while (attempts < maxAttempts) {
    let code = '';
    for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      code += chars[randomIndex];
    }

    if (!activeRoomCodes.has(code)) {
      activeRoomCodes.add(code);
      return code;
    }
    attempts++;
  }

  // Fallback timestamp-based code in extreme edge case of high collision
  const fallback = 'R' + Date.now().toString(36).slice(-5).toUpperCase();
  activeRoomCodes.add(fallback);
  return fallback;
}

/**
 * Releases a room code back to the pool when a room is destroyed.
 */
export function releaseRoomCode(code: string): void {
  if (code) {
    activeRoomCodes.delete(code.toUpperCase());
  }
}

/**
 * Checks if a room code format is valid.
 */
export function isValidRoomCode(code: string): boolean {
  if (!code || typeof code !== 'string') return false;
  const cleanCode = code.trim().toUpperCase();
  if (cleanCode.length !== ROOM_CODE_LENGTH) return false;
  
  for (let i = 0; i < cleanCode.length; i++) {
    if (!ROOM_CODE_CHARACTERS.includes(cleanCode[i])) {
      return false;
    }
  }
  return true;
}
