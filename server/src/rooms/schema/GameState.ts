import { Schema, type, MapSchema } from '@colyseus/schema';
import { PlayerSchema } from './PlayerSchema';
import { RoomStatus, MAX_PLAYERS_PER_ROOM } from '@fps/shared';

export class GameState extends Schema {
  @type('string')
  roomCode: string = '';

  @type('string')
  hostSessionId: string = '';

  @type('string')
  status: RoomStatus = 'LOBBY';

  @type('number')
  maxPlayers: number = MAX_PLAYERS_PER_ROOM;

  @type('string')
  mapName: string = 'StylizedOutpost';

  @type('number')
  createdAt: number = Date.now();

  @type({ map: PlayerSchema })
  players = new MapSchema<PlayerSchema>();

  constructor(roomCode: string = '') {
    super();
    this.roomCode = roomCode;
    this.createdAt = Date.now();
  }
}
