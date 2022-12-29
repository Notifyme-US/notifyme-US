'use strict';

require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const authRouter = require('./auth/authRouter');
const internalRouter = require('./internal-api');
const { getCurrentWeather, getForecast, displayForecast } = require('./external-api');
const { db, subs } = require('./models/index');

const PORT = process.env.PORT || 8080;

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

  socket.on('WEATHER', async payload => {
    try {
      const forecast = await getForecast(payload.zip);
      const text = displayForecast(forecast);
      socket.emit('API_RESULT', text);
    } catch(e) {
      console.log(e);
    }
  });

  socket.on('SUBSCRIBE', async payload => {
    try {
      // payload is { username, type }
      const newSub = await subs.create(payload);
      console.log(newSub);
      socket.emit('API_RESULT', 'subscription successful');
    } catch(e) {
      console.log(e);
    }
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
app.use('/internal', internalRouter);

app.get('/', (req, res) => {
  res.status(200).send('Proof of life.');
});


db.sync().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`listening on port: ${PORT}`);
  });
});
