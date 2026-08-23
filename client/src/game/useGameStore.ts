import { create } from 'zustand';
import { 
  IPlayer, 
  RoomStatus, 
  KillFeedItem, 
  CharacterClass, 
  DEFAULT_CHARACTER, 
  MAX_PLAYER_HEALTH 
} from '@fps/shared';

export type AppScreen = 'LANDING' | 'LOBBY' | 'PLAYING';

export interface HitmarkerState {
  isHeadshot: boolean;
  timestamp: number;
}

interface GameStoreState {
  screen: AppScreen;
  roomCode: string;
  localPlayerName: string;
  localSessionId: string;
  isHost: boolean;
  roomStatus: RoomStatus;
  players: Record<string, IPlayer>;
  isPointerLocked: boolean;
  errorMessage: string | null;
  isConnecting: boolean;
  ping: number;

  // Theme and Character Selection
  selectedCharacter: CharacterClass;

  // Combat State
  health: number;
  maxHealth: number;
  kills: number;
  deaths: number;
  isDead: boolean;
  isShielded: boolean;
  respawnCountdown: number;
  eliminatedBy: string | null;
  killFeed: KillFeedItem[];
  hitmarker: HitmarkerState | null;
  damageFlash: boolean;

  // Actions
  setScreen: (screen: AppScreen) => void;
  setLocalPlayerName: (name: string) => void;
  setRoomCode: (code: string) => void;
  setSessionInfo: (sessionId: string, isHost: boolean, roomCode: string) => void;
  setRoomStatus: (status: RoomStatus) => void;
  setSelectedCharacter: (character: CharacterClass) => void;
  setPlayers: (players: Record<string, IPlayer>) => void;
  updatePlayer: (sessionId: string, player: IPlayer) => void;
  removePlayer: (sessionId: string) => void;
  setPointerLocked: (locked: boolean) => void;
  setErrorMessage: (msg: string | null) => void;
  setIsConnecting: (connecting: boolean) => void;
  setPing: (ping: number) => void;

  // Combat Actions
  setHealth: (health: number) => void;
  setCombatStats: (kills: number, deaths: number) => void;
  setIsDead: (isDead: boolean) => void;
  setIsShielded: (isShielded: boolean) => void;
  setRespawnCountdown: (count: number) => void;
  setEliminatedBy: (name: string | null) => void;
  triggerHitmarker: (isHeadshot: boolean) => void;
  triggerDamageFlash: () => void;
  addKillFeedItem: (item: KillFeedItem) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStoreState>((set) => ({
  screen: 'LANDING',
  roomCode: '',
  localPlayerName: '',
  localSessionId: '',
  isHost: false,
  roomStatus: 'LOBBY',
  players: {},
  isPointerLocked: false,
  errorMessage: null,
  isConnecting: false,
  ping: 0,

  // Theme & Character Defaults
  selectedCharacter: DEFAULT_CHARACTER,

  // Combat State Defaults
  health: MAX_PLAYER_HEALTH,
  maxHealth: MAX_PLAYER_HEALTH,
  kills: 0,
  deaths: 0,
  isDead: false,
  isShielded: false,
  respawnCountdown: 0,
  eliminatedBy: null,
  killFeed: [],
  hitmarker: null,
  damageFlash: false,

  setScreen: (screen) => set({ screen }),
  setLocalPlayerName: (localPlayerName) => set({ localPlayerName }),
  setRoomCode: (roomCode) => set({ roomCode }),
  setSessionInfo: (localSessionId, isHost, roomCode) => 
    set({ localSessionId, isHost, roomCode }),
  setRoomStatus: (roomStatus) => set({ roomStatus }),
  setSelectedCharacter: (selectedCharacter) => set({ selectedCharacter }),
  setPlayers: (players) => set({ players }),
  updatePlayer: (sessionId, player) =>
    set((state) => {
      const nextPlayers = { ...state.players, [sessionId]: player };
      if (sessionId === state.localSessionId) {
        return {
          players: nextPlayers,
          health: player.health ?? state.health,
          kills: player.kills ?? state.kills,
          deaths: player.deaths ?? state.deaths,
          isDead: player.isDead ?? state.isDead,
          isShielded: player.isShielded ?? state.isShielded,
        };
      }
      return { players: nextPlayers };
    }),
  removePlayer: (sessionId) =>
    set((state) => {
      const next = { ...state.players };
      delete next[sessionId];
      return { players: next };
    }),
  setPointerLocked: (isPointerLocked) => set({ isPointerLocked }),
  setErrorMessage: (errorMessage) => set({ errorMessage }),
  setIsConnecting: (isConnecting) => set({ isConnecting }),
  setPing: (ping) => set({ ping }),

  setHealth: (health) => set({ health }),
  setCombatStats: (kills, deaths) => set({ kills, deaths }),
  setIsDead: (isDead) => set({ isDead }),
  setIsShielded: (isShielded) => set({ isShielded }),
  setRespawnCountdown: (respawnCountdown) => set({ respawnCountdown }),
  setEliminatedBy: (eliminatedBy) => set({ eliminatedBy }),

  triggerHitmarker: (isHeadshot) =>
    set({ hitmarker: { isHeadshot, timestamp: Date.now() } }),

  triggerDamageFlash: () => {
    set({ damageFlash: true });
    setTimeout(() => {
      set({ damageFlash: false });
    }, 180);
  },

  addKillFeedItem: (item) =>
    set((state) => ({
      killFeed: [...state.killFeed.slice(-5), item],
    })),

  resetGame: () =>
    set({
      screen: 'LANDING',
      roomCode: '',
      isHost: false,
      roomStatus: 'LOBBY',
      players: {},
      isPointerLocked: false,
      errorMessage: null,
      isConnecting: false,
      health: MAX_PLAYER_HEALTH,
      kills: 0,
      deaths: 0,
      isDead: false,
      isShielded: false,
      respawnCountdown: 0,
      eliminatedBy: null,
      killFeed: [],
      hitmarker: null,
      damageFlash: false,
    }),
}));
