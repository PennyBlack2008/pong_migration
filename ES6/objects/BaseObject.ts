import { GameStatusType, RectangleType } from '../types/Game';
import Room from './Room';

export default class BaseObject {
  status: GameStatusType = 'none';

  object: null | RectangleType = null;

  update: (room: Room) => void;

  reset(): void {
    this.status = 'none';
    this.object = null;
    this.update = null;
  }
}
