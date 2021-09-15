import { Server, Socket } from 'socket.io';
import RoomManager from './RoomManager';

export default class LobbyManager {
  io: Server;

  lobby: Socket[];

  dispatching = false;

  constructor(io: Server) {
    this.io = io;
  }

  push(socket: Socket): void {
    if (this.lobby.indexOf(socket) < 0) this.lobby.push(socket);
  }

  kick(socket: Socket): void {
    const index = this.lobby.indexOf(socket);
    if (index >= 0) this.lobby.splice(index, 1);
  }

  clean(): void {
    this.lobby.length = 0;
  }

  dispatch(roomManager: RoomManager): void {
    if (this.dispatching) return;
    this.dispatching = true;
    while (this.lobby.length > 1) {
      const player0 = this.lobby.splice(0, 1)[0];
      const player1 = this.lobby.splice(0, 1)[0];
      roomManager.createRoom(player0, player1);
      // console.log("lobbyOut: "+player0.id);
      // console.log("lobbyOut: "+player1.id);
      // console.log("lobbyOut.length: "+LbMg.lobby.length);
    }
    this.dispatching = false;
  }
}
