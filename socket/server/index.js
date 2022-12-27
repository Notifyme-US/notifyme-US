'use strict';

require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const authRouter = require('./auth/authRouter');
const { db } = require('./models/index');
const cors = require('cors');

const PORT = process.env.PORT || 3002;

const app = express();
const httpServer = createServer(app);
const server = new Server(httpServer);
const chat = server.of('/chat');

const dtf = new Intl.DateTimeFormat('en-US', {timeStyle: 'medium'});
const users = {};

chat.on('connection', socket => {
  console.log('client connected on socket: ', socket.id);
  socket.on('JOIN', payload => { //payload = {username: string, room: string}
    const { username, room } = payload;
    console.log('🚀 ~ file: index.js:19 ~ username', username);
    users[socket.id] = {
      username,
      room,
    };
    console.log('🚀 ~ file: index.js:19 ~ users', users);
    socket.join(room);
    console.log(`${username} joined room: ${room}`);
    socket.to(room).emit('NEW_JOIN', `${username} has joined the room`);
    socket.emit(`Welcome, ${username}`);
  });

  socket.on('MESSAGE', payload => { //payload = {content: string}
    const { username, room } = users[socket.id];
    console.log('🚀 ~ file: index.js:27 ~ username', username);
    payload.username = username;
    socket.to(room).emit('MESSAGE', payload);
    // socket.emit('MESSAGE', payload);

    const dt = dtf.format(new Date());
    payload.received = `Message received by server at ${dt}`;
    socket.emit('RECEIVED', payload);
  });


  socket.on('TYPING', payload => { //payload = null
    const username = users[socket.id];
    socket.broadcast.emit('TYPING', username);
  });

  socket.on('disconnect', reason => {
    console.log('client disconnected');
    if(users[socket.id]) {
      const { username, room } = users[socket.id];
      socket.to(room).emit('LEAVE', `${username} has left the room`);
      delete users[socket.id];
    }
  });
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(authRouter);

db.sync().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`listening on port: ${PORT}`);
  });
});
