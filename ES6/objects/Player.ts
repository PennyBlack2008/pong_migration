import SETTINGS from '../../myProject/SETTINGS';
import { PlayerPositionType } from '../types/Game';
import { getRandomColorCode } from '../utils/color';
import BaseObject from './BaseObject';
import Room from './Room';

enum KeypressType {
  LEFT = 37,
  UP,
  RIGHT,
  DOWN,
}
const UNIT = 2;

export default class Player extends BaseObject {
  id: string;

  score = 0;

  ready = false;

  keypress: {
    [KeypressType.LEFT]: boolean,
    [KeypressType.UP]: boolean,
    [KeypressType.RIGHT]: boolean,
    [KeypressType.DOWN]: boolean,
  };

  mouse: {
    move: { x: number, y: number } | null,
    click: { x: number, y: number } | null,
  } = { move: null, click: null };

  constructor(id: string, position: PlayerPositionType) {
    super();

    const color = getRandomColorCode();
    this.id = id;
    this.object = {
      height: SETTINGS.PLAYER.HEIGHT,
      width: SETTINGS.PLAYER.WIDTH,
      x: position === 'LEFT' ? SETTINGS.PLAYER.GAP : SETTINGS.WIDTH - SETTINGS.PLAYER.GAP,
      y: SETTINGS.HEIGHT / 2,
      color: { fill: color },
    };
    this.keypress = {
      [KeypressType.LEFT]: false,
      [KeypressType.UP]: false,
      [KeypressType.RIGHT]: false,
      [KeypressType.DOWN]: false,
    };
    super.update = this.setUpdate;
  }

  setUpdate(room: Room): void {
    const player = this.object;
    if (room.status === 'countdown' || room.status === 'playing') {
      if (this.keypress[KeypressType.UP]) {
        this.moveUp();
        this.mouse.click = null;
      }
      if (this.keypress[KeypressType.DOWN]) {
        this.moveDown();
        this.mouse.click = null;
      }
      if (this.mouse.click
        && ((this.mouse.click.x < player.x + 50 && this.mouse.click.x > player.x - 50)
          || (this.mouse.click.x === null))) {
        if (this.mouse.click.y < player.y - 5) {
          this.moveUp();
        } else if (this.mouse.click.y > player.y + 5) {
          this.moveDown();
        } else {
          this.mouse.click = null;
        }
      }
    }
  }

  moveUp(): void {
    if (this.object.y - this.object.height / 2 - UNIT >= 0 + SETTINGS.BORDER_WIDTH) {
      this.object.y -= UNIT;
    }
  }

  moveDown(): void {
    if (this.object.y + this.object.height / 2 + UNIT <= SETTINGS.HEIGHT - SETTINGS.BORDER_WIDTH) {
      this.object.y += UNIT;
    }
  }
}
