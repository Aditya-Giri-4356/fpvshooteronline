import { Client, Room } from 'colyseus.js';
import { 
  IPlayer, 
  NetworkMessages, 
  MovePayload, 
  ShootPayload, 
  KillFeedItem, 
  RoomStatus, 
  ThemeType,
  CharacterClass,
  generateRoomCode,
  RESPAWN_TIME_SECONDS
} from '@fps/shared';
import { useGameStore } from '../game/useGameStore';
import { soundFX } from '../audio/SoundFX';

export function getRawServerUrl(): string {
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('FPS_CUSTOM_SERVER_URL');
    if (customUrl && customUrl.trim()) return customUrl.trim();
  }

  const envUrl = import.meta.env.VITE_SERVER_URL;
  if (envUrl && envUrl.trim()) return envUrl.trim();

  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:2567';
  }

  return '';
}

export function setCustomServerUrl(url: string) {
  if (typeof window !== 'undefined') {
    if (!url.trim()) {
      localStorage.removeItem('FPS_CUSTOM_SERVER_URL');
    } else {
      localStorage.setItem('FPS_CUSTOM_SERVER_URL', url.trim());
    }
  }
  networkManager.resetClient();
}

export function getServerUrl(): { httpUrl: string; wsUrl: string } {
  let base = getRawServerUrl();

  if (!base) {
    base = typeof window !== 'undefined' && window.location.hostname === 'localhost'
      ? 'http://localhost:2567'
      : 'http://localhost:2567';
  }

  base = base.replace(/\/$/, '');

  const wsUrl = base.replace(/^http:\/\//, 'ws://').replace(/^https:\/\//, 'wss://');
  const httpUrl = base.replace(/^ws:\/\//, 'http://').replace(/^wss:\/\//, 'https://');

  return { httpUrl, wsUrl };
}

// Global visual callback bridges for 3D Tracers and Floating Damage Numbers
export let onRemoteShootCallback: ((data: ShootPayload & { shooterSessionId: string }) => void) | null = null;
export let onPlayerHitCallback: ((data: { targetSessionId: string; damage: number; isHeadshot: boolean; hitX: number; hitY: number; hitZ: number }) => void) | null = null;
export let onLocalRespawnCallback: ((pos: { x: number; y: number; z: number }) => void) | null = null;

export function registerCombatCallbacks(callbacks: {
  onRemoteShoot?: (data: ShootPayload & { shooterSessionId: string }) => void;
  onPlayerHit?: (data: { targetSessionId: string; damage: number; isHeadshot: boolean; hitX: number; hitY: number; hitZ: number }) => void;
  onLocalRespawn?: (pos: { x: number; y: number; z: number }) => void;
}) {
  if (callbacks.onRemoteShoot) onRemoteShootCallback = callbacks.onRemoteShoot;
  if (callbacks.onPlayerHit) onPlayerHitCallback = callbacks.onPlayerHit;
  if (callbacks.onLocalRespawn) onLocalRespawnCallback = callbacks.onLocalRespawn;
}

class NetworkManager {
  private client: Client | null = null;
  public room: Room<any> | null = null;
  private lastMoveSendTime = 0;
  private pingInterval: any = null;
  private respawnInterval: any = null;

  public resetClient() {
    this.client = null;
    if (this.room) {
      this.leaveRoom();
    }
  }

  private getClient(): Client {
    if (!this.client) {
      const { wsUrl } = getServerUrl();
      console.log(`[NetworkManager] Initializing Colyseus Client with WebSocket URL: ${wsUrl}`);
      const client = new Client(wsUrl);

      // Compatibility shim for Colyseus 0.17 matchmaker responses
      const origConsume = (client as any).consumeSeatReservation.bind(client);
      (client as any).consumeSeatReservation = function (response: any, previousRoom?: any) {
        if (response && !response.room && response.name && response.sessionId) {
          response = { room: response, sessionId: response.sessionId };
        }
        return origConsume(response, previousRoom);
      };

      this.client = client;
    }
    return this.client;
  }

  /**
   * Checks server health status and warms up connections.
   */
  async checkServerHealth(): Promise<{ online: boolean; latency?: number; message?: string }> {
    const { httpUrl } = getServerUrl();
    const start = performance.now();
    try {
      const res = await fetch(`${httpUrl}/ping`, { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const latency = Math.round(performance.now() - start);
        return { online: true, latency };
      }
      return { online: false, message: 'Server returned error.' };
    } catch (err: any) {
      try {
        const res = await fetch(`${httpUrl}/health`, { signal: AbortSignal.timeout(4000) });
        if (res.ok) {
          const latency = Math.round(performance.now() - start);
          return { online: true, latency };
        }
      } catch {}
      return { online: false, message: 'Cannot reach multiplayer server. Render free tier takes ~30s to wake up if idle.' };
    }
  }

  async validateRoomCode(roomCode: string): Promise<{ valid: boolean; error?: string }> {
    const { httpUrl } = getServerUrl();
    try {
      const cleanCode = roomCode.trim().toUpperCase();
      const res = await fetch(`${httpUrl}/api/rooms/${cleanCode}`, { signal: AbortSignal.timeout(4000) });
      const data = await res.json();
      if (!res.ok || !data.exists) {
        return { valid: false, error: data.error || `Room '${cleanCode}' does not exist.` };
      }
      return { valid: true };
    } catch (err) {
      console.warn('[NetworkManager] HTTP room validation fallback:', err);
      return { valid: true };
    }
  }

  async createRoom(playerName: string, characterClass?: CharacterClass, selectedTheme?: ThemeType): Promise<string> {
    const store = useGameStore.getState();
    store.setIsConnecting(true);
    store.setErrorMessage(null);

    const generatedCode = generateRoomCode();
    const chosenClass = characterClass || store.selectedCharacter;
    const chosenTheme = selectedTheme || store.selectedTheme;

    try {
      const client = this.getClient();
      const room = await client.create('game_room', {
        roomCode: generatedCode,
        playerName,
        characterClass: chosenClass,
        selectedTheme: chosenTheme,
        isHost: true,
      });

      this.room = room;
      this.setupRoomListeners(room);

      const actualRoomCode = room.state?.roomCode || generatedCode;
      store.setSessionInfo(room.sessionId, true, actualRoomCode);
      store.setScreen('LOBBY');
      store.setIsConnecting(false);

      console.log(`[NetworkManager] Created and joined room: ${actualRoomCode} (sessionId: ${room.sessionId})`);
      return actualRoomCode;
    } catch (error: any) {
      console.error('[NetworkManager] Failed to create room:', error);
      store.setIsConnecting(false);
      const rawUrl = getRawServerUrl();
      const msg = !rawUrl || rawUrl.includes('localhost')
        ? 'Could not connect to multiplayer server. Please configure your Render server URL in settings below.'
        : `Could not connect to ${rawUrl}. Render free servers take ~30-50s to wake up on first load.`;
      store.setErrorMessage(msg);
      throw error;
    }
  }

  async joinRoom(roomCode: string, playerName: string, characterClass?: CharacterClass): Promise<void> {
    const store = useGameStore.getState();
    const cleanCode = roomCode.trim().toUpperCase();
    const chosenClass = characterClass || store.selectedCharacter;

    store.setIsConnecting(true);
    store.setErrorMessage(null);

    const validation = await this.validateRoomCode(cleanCode);
    if (!validation.valid) {
      store.setIsConnecting(false);
      store.setErrorMessage(validation.error || `Room '${cleanCode}' does not exist.`);
      throw new Error(validation.error);
    }

    try {
      const client = this.getClient();
      const room = await client.join('game_room', {
        roomCode: cleanCode,
        playerName,
        characterClass: chosenClass,
        isHost: false,
      });

      this.room = room;
      this.setupRoomListeners(room);

      const isHost = room.state?.hostSessionId === room.sessionId;
      store.setSessionInfo(room.sessionId, isHost, cleanCode);
      store.setScreen('LOBBY');
      store.setIsConnecting(false);

      console.log(`[NetworkManager] Joined room: ${cleanCode} (sessionId: ${room.sessionId})`);
    } catch (error: any) {
      console.error('[NetworkManager] Failed to join room:', error);
      store.setIsConnecting(false);
      const msg = error.message && error.message.includes('matchmake')
        ? `Room '${cleanCode}' not found or is unavailable.`
        : error.message || `Could not join room '${cleanCode}'.`;
      store.setErrorMessage(msg);
      throw error;
    }
  }

  selectTheme(theme: ThemeType) {
    if (this.room) {
      this.room.send(NetworkMessages.SELECT_THEME, theme);
      useGameStore.getState().setSelectedTheme(theme);
    }
  }

  selectCharacter(characterClass: CharacterClass) {
    useGameStore.getState().setSelectedCharacter(characterClass);
    if (this.room) {
      this.room.send(NetworkMessages.SELECT_CHARACTER, characterClass);
    }
  }

  startGame() {
    if (this.room) {
      console.log('[NetworkManager] Sending START_GAME message to room.');
      this.room.send(NetworkMessages.START_GAME);
    }
  }

  sendPlayerMove(x: number, y: number, z: number, rotX: number, rotY: number) {
    if (!this.room) return;

    const now = performance.now();
    if (now - this.lastMoveSendTime < 50) return;
    this.lastMoveSendTime = now;

    const payload: MovePayload = { x, y, z, rotX, rotY };
    this.room.send(NetworkMessages.PLAYER_MOVE, payload);
  }

  sendPlayerShoot(payload: ShootPayload) {
    if (!this.room) return;
    this.room.send(NetworkMessages.PLAYER_SHOOT, payload);
  }

  sendRespawn() {
    if (!this.room) return;
    this.room.send(NetworkMessages.PLAYER_RESPAWN);
  }

  leaveRoom() {
    if (this.room) {
      console.log('[NetworkManager] Leaving room...');
      this.room.leave();
      this.room = null;
    }
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.respawnInterval) {
      clearInterval(this.respawnInterval);
      this.respawnInterval = null;
    }
    useGameStore.getState().resetGame();
  }

  private setupRoomListeners(room: Room<any>) {
    const store = useGameStore.getState();

    room.state.players.onAdd((player: any, sessionId: string) => {
      const pData: IPlayer = {
        id: sessionId,
        name: player.name,
        isHost: player.isHost,
        ready: player.ready,
        characterClass: player.characterClass || 'VANGUARD',
        x: player.x,
        y: player.y,
        z: player.z,
        rotX: player.rotX,
        rotY: player.rotY,
        colorIndex: player.colorIndex,
        ping: player.ping,
        health: player.health ?? 100,
        maxHealth: player.maxHealth ?? 100,
        kills: player.kills ?? 0,
        deaths: player.deaths ?? 0,
        isDead: player.isDead ?? false,
        isShielded: player.isShielded ?? false,
        lastShotTime: player.lastShotTime ?? 0,
      };

      store.updatePlayer(sessionId, pData);

      player.onChange(() => {
        store.updatePlayer(sessionId, {
          id: sessionId,
          name: player.name,
          isHost: player.isHost,
          ready: player.ready,
          characterClass: player.characterClass || 'VANGUARD',
          x: player.x,
          y: player.y,
          z: player.z,
          rotX: player.rotX,
          rotY: player.rotY,
          colorIndex: player.colorIndex,
          ping: player.ping,
          health: player.health,
          maxHealth: player.maxHealth,
          kills: player.kills,
          deaths: player.deaths,
          isDead: player.isDead,
          isShielded: player.isShielded,
          lastShotTime: player.lastShotTime,
        });
      });
    });

    room.state.players.onRemove((_player: any, sessionId: string) => {
      store.removePlayer(sessionId);
    });

    room.state.onChange(() => {
      if (room.state.status) {
        store.setRoomStatus(room.state.status as RoomStatus);
        if (room.state.status === 'PLAYING' && store.screen !== 'PLAYING') {
          store.setScreen('PLAYING');
        }
      }
      if (room.state.selectedTheme) {
        store.setSelectedTheme(room.state.selectedTheme as ThemeType);
      }
      if (room.state.hostSessionId) {
        const isLocalHost = room.state.hostSessionId === room.sessionId;
        if (isLocalHost !== store.isHost) {
          useGameStore.setState({ isHost: isLocalHost });
        }
      }
    });

    room.onMessage(NetworkMessages.PLAYER_SHOOT, (data: ShootPayload & { shooterSessionId: string }) => {
      if (onRemoteShootCallback) {
        onRemoteShootCallback(data);
      }
    });

    room.onMessage(NetworkMessages.PLAYER_HIT, (data: { targetSessionId: string; damage: number; isHeadshot: boolean; hitX: number; hitY: number; hitZ: number }) => {
      soundFX.playHitmarkerSound(data.isHeadshot);
      store.triggerHitmarker(data.isHeadshot);
      if (onPlayerHitCallback) {
        onPlayerHitCallback(data);
      }
    });

    room.onMessage(NetworkMessages.DAMAGE_TAKEN, (data: { attackerSessionId: string; attackerName: string; damage: number; newHealth: number }) => {
      soundFX.playHurtSound();
      store.triggerDamageFlash();
      store.setHealth(data.newHealth);
    });

    room.onMessage(NetworkMessages.PLAYER_DIED, (data: { victimSessionId: string; attackerSessionId: string; isHeadshot: boolean }) => {
      if (data.victimSessionId === room.sessionId) {
        const attacker = store.players[data.attackerSessionId];
        const attackerName = attacker ? attacker.name : 'Opponent';

        store.setIsDead(true);
        store.setEliminatedBy(attackerName);
        store.setRespawnCountdown(RESPAWN_TIME_SECONDS);

        let remaining = RESPAWN_TIME_SECONDS;
        if (this.respawnInterval) clearInterval(this.respawnInterval);

        this.respawnInterval = setInterval(() => {
          remaining -= 1;
          store.setRespawnCountdown(remaining);
          if (remaining <= 0) {
            clearInterval(this.respawnInterval);
            this.respawnInterval = null;
            this.sendRespawn();
          }
        }, 1000);
      } else if (data.attackerSessionId === room.sessionId) {
        soundFX.playEliminationSound();
      }
    });

    room.onMessage(NetworkMessages.PLAYER_RESPAWN, (pos: { x: number; y: number; z: number }) => {
      store.setIsDead(false);
      store.setEliminatedBy(null);
      store.setRespawnCountdown(0);
      store.setHealth(100);
      soundFX.playRespawnSound();

      if (onLocalRespawnCallback) {
        onLocalRespawnCallback(pos);
      }
    });

    room.onMessage(NetworkMessages.KILL_FEED, (item: KillFeedItem) => {
      store.addKillFeedItem(item);
    });

    room.onMessage(NetworkMessages.START_GAME, () => {
      store.setRoomStatus('PLAYING');
      store.setScreen('PLAYING');
    });

    room.onMessage(NetworkMessages.ROOM_ERROR, (err: { message: string }) => {
      store.setErrorMessage(err.message);
    });

    room.onMessage(NetworkMessages.PONG, (sentTime: number) => {
      const latency = Math.round(performance.now() - sentTime);
      store.setPing(latency);
    });

    if (this.pingInterval) clearInterval(this.pingInterval);
    this.pingInterval = setInterval(() => {
      if (this.room) {
        this.room.send(NetworkMessages.PING, performance.now());
      }
    }, 3000);

    room.onLeave((code) => {
      console.warn(`[NetworkManager] Disconnected from room with code: ${code}`);
      if (code > 1000) {
        store.setErrorMessage('Disconnected from room server.');
      }
      this.leaveRoom();
    });
  }
}

export const networkManager = new NetworkManager();
