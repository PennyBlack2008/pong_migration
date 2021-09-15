import { Server, Socket } from 'socket.io';
import Countdown from '../../pongOnline/objects/CountdownObject';
import RoomManager from '../RoomManager';
import { SETTINGS } from '../SETTINGS';
import { EmitStatusType, GameStatusType } from '../types/Game';
import Ball from './Ball';
import Player from './Player';

export default class Room {
  io: Server;

  id: string;

  status: GameStatusType;

  manager: RoomManager;

  sockets: Socket[];

  players: Record<string, Player> = {};

  countdown: Countdown | null;

  gameOverDelay: number;

  ball: Ball;

  loop: () => void;

  constructor(manager: RoomManager, io: Server, roomId: string, socket0: Socket, socket1: Socket) {
    this.io = io;
    this.id = roomId;
    this.status = 'none';
    this.manager = manager;
    this.sockets = [socket0, socket1];
    this.players[this.sockets[0].id] = new Player(this.sockets[0].id, 'LEFT');
    this.players[this.sockets[1].id] = new Player(this.sockets[1].id, 'RIGHT');
    this.ball = new Ball(this.players[0].id, this.players[1].id);
    this.countdown = null;
    this.gameOverDelay = 3;
    this.loop = null;
  }

  playInit(): void {
    this.status = 'countdown';
    this.loop = this.playLoop;
    this.countdown = new Countdown(3);
    this.countdown.action = () => {
      delete this.countdown;
      this.status = 'playing';
    };
    this.io.to(this.id).emit('playing');
  }

  playLoop(): void {
    const statuses = this.getStats();
    this.io.to(this.id).emit('update', statuses);
    if (this.status === 'playing' && (this.players[this.sockets[0].id].score >= SETTINGS.GOAL || this.players[this.sockets[1].id].score >= SETTINGS.GOAL)) {
      this.status = 'gameOver';
      this.gameOverDelay = 3;
    }
    if (this.status === 'gameOver' && this.gameOverDelay < 0) {
      if (this.players[this.sockets[0].id].score > this.players[this.sockets[1].id].score) {
        this.manager.gameOverRoom(this.id, this.sockets[0].id);
      } else {
        this.manager.gameOverRoom(this.id, this.sockets[1].id);
      }
    }
  }

  readyInit(): void {
    this.status = 'ready';
    this.loop = this.readyLoop;
    this.countdown = new Countdown(10);
    this.countdown.action = () => {
      delete this.countdown;
      this.manager.destroyRoom(this.id);
    };
  }

  readyLoop(): void {
    const player0ready = this.players[this.players[0].id].ready;
    const player1ready = this.players[this.players[1].id].ready;
    if (player0ready && player1ready) this.playInit();
    const statuses = this.getStats();
    this.io.to(this.id).emit('update', statuses);
  }

  getStats(): EmitStatusType[] {
    const statuses: EmitStatusType[] = [];
    const keys = Object.keys(this.players);
    keys.forEach((key) => {
      const object = this.players[key];
      object.update(this);
      statuses.push({ status: object.status, object: object.object });
    });
    return statuses;
  }
}
