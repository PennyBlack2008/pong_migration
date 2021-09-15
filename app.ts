import express from 'express';
import path from 'path';
import { SETTINGS } from './ES6/SETTINGS';
import LobbyManager from './ES6/LobbyManager';
import RoomManager from './ES6/RoomManager';
import GameManager from './ES6/GameManager';

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static(path.join(__dirname, 'public')));

const port = process.env.PORT || 3000;
http.listen(port, () => {
  console.log('server on!: http://localhost:3000/');
});


const lobbyManager = new LobbyManager(io);
const roomManager = new RoomManager(io);
const gameManager = new GameManager(roomManager);

io.on('connection', (socket) => {
  console.log('user connected: ', socket.id);
  io.to(socket.id).emit('connected', SETTINGS.CLIENT_SETTINGS);
  socket.broadcast.emit('new user entered');
  io.emit('total user count updated', socket.server.eio.clientsCount);

  socket.on('waiting', () => {
    // console.log('waiting from '+socket.id);
    lobbyManager.push(socket);
    lobbyManager.dispatch(roomManager);
  });
  socket.on('disconnect', () => {
    const roomIndex = roomManager.roomIndex[socket.id];
    if (roomIndex) roomManager.destroyRoom(roomIndex);
    lobbyManager.kick(socket);
    console.log('user disconnected: ', socket.id);
    io.emit('total user count updated', socket.server.eio.clientsCount);
  });
  socket.on('keydown', (keyCode) => {
    const roomIndex = roomManager.roomIndex[socket.id];
    if (roomIndex) roomManager.rooms[roomIndex].players[socket.id].keypress[keyCode] = true;
  });
  socket.on('ready', () => {
    const roomIndex = roomManager.roomIndex[socket.id];
    if (roomIndex) roomManager.rooms[roomIndex].players[socket.id].ready = true;
  });
  socket.on('keyup', (keyCode) => {
    const roomIndex = roomManager.roomIndex[socket.id];
    if (roomIndex) delete roomManager.rooms[roomIndex].players[socket.id].keypress[keyCode];
  });
  socket.on('mousemove', (x, y) => {
    const roomIndex = roomManager.roomIndex[socket.id];
    if (roomIndex) roomManager.rooms[roomIndex].players[socket.id].mouse.move = { x, y };
  });
  socket.on('click', (x, y) => {
    const roomIndex = roomManager.roomIndex[socket.id];
    if (roomIndex) roomManager.rooms[roomIndex].players[socket.id].mouse.click = { x, y };
  });
});
