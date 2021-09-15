import { Server, Socket } from 'socket.io';
import Room from './objects/Room';

export default class RoomManager {
  io: Server;

  rooms: Record<string, Room> = {};

  roomIndex: Record<string, string> = {};

  constructor(io: Server) {
    this.io = io;
  }

  createRoom(socket0: Socket, socket1: Socket): void {
    const roomId = socket0.id + socket1.id;
    const room = new Room(this, this.io, roomId, socket0, socket1);
    socket0.join(roomId);
    socket1.join(roomId);
    this.rooms[roomId] = room;
    this.roomIndex[socket0.id] = roomId;
    this.roomIndex[socket1.id] = roomId;
    room.readyInit();
    this.io.to(socket0.id).emit('ready', 'left');
    this.io.to(socket1.id).emit('ready', 'right');
    console.log('Room Created :', roomId);
  }

  destroyRoom(roomId: string): void {
    const room = this.rooms[roomId];
    room.sockets.forEach((socket) => {
      const message = (!room.players[socket.id].ready && !room.players.countdown) ? 'YOU ARE NOT PREPARED' : null;
      delete this.roomIndex[socket.id];
      this.io.to(socket.id).emit('destroy', message);
    });
    delete this.rooms[roomId];
  }

  gameOverRoom(roomId: string, winnerId: string): void {
    const room = this.rooms[roomId];
    room.sockets.forEach((socket) => {
      const message = (socket.id === winnerId) ? 'YOU WIN!' : 'YOU LOSE!';
      delete this.roomIndex[socket.id];
      this.io.to(socket.id).emit('destroy', message);
    });
    delete this.rooms[roomId];
  }
}
