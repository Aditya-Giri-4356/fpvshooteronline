import { Schema, type } from '@colyseus/schema';
import { IPlayer, MAX_PLAYER_HEALTH } from '@fps/shared';

export class PlayerSchema extends Schema implements IPlayer {
  @type('string')
  id: string = '';

  @type('string')
  name: string = 'Operator';

  @type('boolean')
  isHost: boolean = false;

  @type('boolean')
  ready: boolean = true;

  @type('number')
  x: number = 0;

  @type('number')
  y: number = 1.0;

  @type('number')
  z: number = 0;

  @type('number')
  rotX: number = 0; // Pitch

  @type('number')
  rotY: number = 0; // Yaw

  @type('number')
  colorIndex: number = 0;

  @type('number')
  ping: number = 0;

  @type('number')
  health: number = MAX_PLAYER_HEALTH;

  @type('number')
  maxHealth: number = MAX_PLAYER_HEALTH;

  @type('number')
  kills: number = 0;

  @type('number')
  deaths: number = 0;

  @type('boolean')
  isDead: boolean = false;

  @type('boolean')
  isShielded: boolean = false;

  @type('number')
  lastShotTime: number = 0;

  constructor(id: string = '', name: string = 'Operator', isHost: boolean = false, colorIndex: number = 0) {
    super();
    this.id = id;
    this.name = name;
    this.isHost = isHost;
    this.colorIndex = colorIndex;
    this.health = MAX_PLAYER_HEALTH;
    this.maxHealth = MAX_PLAYER_HEALTH;
    this.kills = 0;
    this.deaths = 0;
    this.isDead = false;
    this.isShielded = false;
    this.lastShotTime = 0;
  }
}
