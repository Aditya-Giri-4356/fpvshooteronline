/**
 * Shared Constants and Metadata for 3D Multiplayer FPS
 */
import { ThemeType, CharacterClass } from './types';

export const ROOM_CODE_LENGTH = 6;
export const ROOM_CODE_CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const ROOM_CODE_CHARACTERS = ROOM_CODE_CHARSET;
export const MAX_PLAYERS_PER_ROOM = 8;
export const MAX_NAME_LENGTH = 16;
export const DEFAULT_PLAYER_NAME = 'Operator';

export const PLAYER_WALK_SPEED = 7.5;
export const PLAYER_SPRINT_SPEED = 12.0;
export const PLAYER_JUMP_FORCE = 7.5;

// Combat Balance Constants
export const MAX_PLAYER_HEALTH = 100;
export const WEAPON_FIRE_RATE_MS = 120; // ~500 RPM rapid-fire arcade feel
export const WEAPON_BODY_DAMAGE = 25;   // 4-shot kill
export const WEAPON_HEADSHOT_DAMAGE = 50; // 2-shot kill (crit)
export const WEAPON_MAX_RANGE = 120;     // Max hitscan distance in units
export const RESPAWN_TIME_SECONDS = 3;   // 3-second respawn timer
export const SPAWN_SHIELD_DURATION_MS = 2000; // 2-second invulnerability on spawn

/**
 * 4 Curated Map / Environment Themes
 */
export interface IThemeMetadata {
  id: ThemeType;
  name: string;
  subtitle: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  bgGradient: string;
  fogColor: string;
  skyColor: string;
  groundColor: string;
  roadColor: string;
  ambientIntensity: number;
  sunIntensity: number;
}

export const MAP_THEMES: Record<ThemeType, IThemeMetadata> = {
  DESERT_OUTPOST: {
    id: 'DESERT_OUTPOST',
    name: 'Desert Outpost',
    subtitle: 'Military Sandstone Stronghold',
    description: 'Arid sandstone canyons with watchtowers, fortified sandbag bunkers, and tactical choke-points.',
    primaryColor: '#f59e0b',
    accentColor: '#d97706',
    bgGradient: 'linear-gradient(135deg, #78350f 0%, #b45309 50%, #f59e0b 100%)',
    fogColor: '#dfb78c',
    skyColor: '#fef3c7',
    groundColor: '#d4a373',
    roadColor: '#8c6d46',
    ambientIntensity: 0.9,
    sunIntensity: 1.6,
  },
  CYBER_METROPOLIS: {
    id: 'CYBER_METROPOLIS',
    name: 'Cyber Metropolis',
    subtitle: 'Neo-Tokyo Urban Highway',
    description: 'Dusk city skyline with multi-lane asphalt highway, illuminated skyscraper facades, and neon road barriers.',
    primaryColor: '#06b6d4',
    accentColor: '#ec4899',
    bgGradient: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #3b0764 100%)',
    fogColor: '#1e1b4b',
    skyColor: '#0f172a',
    groundColor: '#1e293b',
    roadColor: '#0f172a',
    ambientIntensity: 0.7,
    sunIntensity: 1.2,
  },
  SCENIC_VALLEY: {
    id: 'SCENIC_VALLEY',
    name: 'Scenic Valley',
    subtitle: 'Alpine Mountain Highway',
    description: 'Rolling green alpine hills inspired by Slow Roads, pine forests, curved scenic road, and mountain horizon.',
    primaryColor: '#10b981',
    accentColor: '#059669',
    bgGradient: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #10b981 100%)',
    fogColor: '#c7e6f8',
    skyColor: '#93c5fd',
    groundColor: '#4f772d',
    roadColor: '#2b2d42',
    ambientIntensity: 0.85,
    sunIntensity: 1.5,
  },
  INDUSTRIAL_DOCKS: {
    id: 'INDUSTRIAL_DOCKS',
    name: 'Industrial Docks',
    subtitle: 'Cargo Port Container Yard',
    description: 'Moody stormy shipping harbor with towering modular cargo containers, metal catwalks, and fuel tanks.',
    primaryColor: '#f43f5e',
    accentColor: '#64748b',
    bgGradient: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #e11d48 100%)',
    fogColor: '#475569',
    skyColor: '#334155',
    groundColor: '#334155',
    roadColor: '#1e293b',
    ambientIntensity: 0.75,
    sunIntensity: 1.3,
  },
};

/**
 * 4 Operative / Character Classes
 */
export interface ICharacterMetadata {
  id: CharacterClass;
  name: string;
  role: string;
  description: string;
  accentColor: string;
  glowColor: string;
  armorColor: string;
  visorColor: string;
  stats: {
    mobility: number;
    armor: number;
    handling: number;
  };
}

export const CHARACTER_CLASSES: Record<CharacterClass, ICharacterMetadata> = {
  VANGUARD: {
    id: 'VANGUARD',
    name: 'Vanguard',
    role: 'Tactical Assault',
    description: 'Frontline combat specialist with balanced mobility and reinforced cobalt-blue tactical armor.',
    accentColor: '#38bdf8',
    glowColor: '#0284c7',
    armorColor: '#1e293b',
    visorColor: '#38bdf8',
    stats: { mobility: 85, armor: 85, handling: 90 },
  },
  PHANTOM: {
    id: 'PHANTOM',
    name: 'Phantom',
    role: 'Cyber Scout',
    description: 'Lightweight carbon-weave stealth operative with ultra-agile strafing and emerald-green optics.',
    accentColor: '#10b981',
    glowColor: '#059669',
    armorColor: '#0f172a',
    visorColor: '#10b981',
    stats: { mobility: 100, armor: 70, handling: 95 },
  },
  JUGGERNAUT: {
    id: 'JUGGERNAUT',
    name: 'Juggernaut',
    role: 'Heavy Enforcer',
    description: 'Titanium-plated battle frame designed to anchor strongholds with glowing crimson energy plating.',
    accentColor: '#f43f5e',
    glowColor: '#e11d48',
    armorColor: '#27272a',
    visorColor: '#f43f5e',
    stats: { mobility: 70, armor: 100, handling: 80 },
  },
  SPECTRE: {
    id: 'SPECTRE',
    name: 'Spectre',
    role: 'Cyber Infiltrator',
    description: 'Futuristic cybernetic infiltrator with precision targeting optics and amber holographic shield conduits.',
    accentColor: '#f59e0b',
    glowColor: '#d97706',
    armorColor: '#18181b',
    visorColor: '#f59e0b',
    stats: { mobility: 90, armor: 80, handling: 100 },
  },
};

export const DEFAULT_THEME: ThemeType = 'SCENIC_VALLEY';
export const DEFAULT_CHARACTER: CharacterClass = 'VANGUARD';

export function generateRoomCode(): string {
  let result = '';
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    const idx = Math.floor(Math.random() * ROOM_CODE_CHARSET.length);
    result += ROOM_CODE_CHARSET[idx];
  }
  return result;
}
