import RoomManager from './RoomManager';

const INTERVAL = 10;

export default class GameManager {
  roomManager: RoomManager;

  update: NodeJS.Timer ;

  constructor(roomManager: RoomManager) {
    this.roomManager = roomManager;
    this.update = setInterval(() => {
      const keys = Object.keys(this.roomManager.rooms);
      keys.forEach((key) => {
        this.roomManager.rooms[key].loop();
      });
    }, INTERVAL);
  }
}
