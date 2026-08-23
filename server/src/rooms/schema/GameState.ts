// Polyfill Symbol.metadata for @colyseus/schema compatibility
(Symbol as any).metadata ??= Symbol('metadata');

import { Schema, type, MapSchema } from '@colyseus/schema';
import { PlayerSchema } from './PlayerSchema';
import { RoomStatus, ThemeType, MAX_PLAYERS_PER_ROOM, DEFAULT_THEME } from '@fps/shared';

export class GameState extends Schema {
  @type('string')
  roomCode: string = '';

  @type('string')
  hostSessionId: string = '';

  @type('string')
  status: RoomStatus = 'LOBBY';

  @type('string')
  selectedTheme: ThemeType = DEFAULT_THEME;

  @type('number')
  maxPlayers: number = MAX_PLAYERS_PER_ROOM;

  @type('string')
  mapName: string = 'Scenic Valley';

  @type('number')
  createdAt: number = Date.now();

  @type({ map: PlayerSchema })
  players = new MapSchema<PlayerSchema>();

  constructor(roomCode: string = '', selectedTheme: ThemeType = DEFAULT_THEME) {
    super();
    this.roomCode = roomCode;
    this.selectedTheme = selectedTheme;
    this.createdAt = Date.now();
  }
}
