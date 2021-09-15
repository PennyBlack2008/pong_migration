import RoomManager from './RoomManager';

const INTERVAL = 10;

export default class GameManager {
  roomManager: RoomManager;

  constructor(roomManager: RoomManager) {
    this.roomManager = roomManager;
  }

  update(): void {
    setInterval(() => {
      const keys = Object.keys(this.roomManager.rooms);
      keys.forEach((key) => {
        this.roomManager.rooms[key].loop();
      });
    }, INTERVAL);
  }
}
