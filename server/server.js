'use strict';

require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const authRouter = require('./auth/authRouter');
const internalRouter = require('./internal-api');
const { getCurrentWeather, getForecast, displayForecast, getTraffic, getEvents, displayTraffic, displayCurrent } = require('./external-api');
const { db, subs } = require('./models/index');

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

  socket.on('LEAVE', payload => {
    const { username, room } = users[socket.id];
    socket.leave(room);
    socket.to(room).emit('NEW_LEAVE', `${username} has left the room`);
  });

  socket.on('MESSAGE', payload => { //payload = {content: string}
    const { username, room } = users[socket.id];
    console.log('🚀 ~ file: index.js:27 ~ username', username);
    payload.username = username;
    socket.to(room).emit('MESSAGE', payload);

    const dt = dtf.format(new Date());
    payload.received = `Message received by server at ${dt}`;
    socket.emit('RECEIVED', payload);
  });

  // socket.on('TYPING', payload => { //payload = null
  //   const username = users[socket.id];
  //   socket.broadcast.emit('TYPING', username);
  // });

  socket.on('WEATHER', async payload => {
    try {
      const forecast = await getForecast(payload.zip);
      const text = displayForecast(forecast);
      socket.emit('API_RESULT', text);
    } catch(e) {
      console.log(e);
    }
  });

  socket.on('CURRENT_WEATHER', async payload => {
    try {
      const current = await getCurrentWeather(payload.zip);
      const text = displayCurrent(current);
      socket.emit('API_RESULT', text);
    } catch(e) {
      console.log(e);
    }
  });

  socket.on('TRAFFIC', async payload => {
    try {
      console.log(payload);
      const traffic = await getTraffic(payload.firstAddress, payload.secondAddress );
      const text = displayTraffic(traffic, payload);
      socket.emit('API_RESULT', text);
    } catch(e) {
      console.log(e);
    }
  });

  socket.on('EVENTS', async payload => {
    try {
      console.log(payload);
      const event = await getEvents(payload.cityName, payload.state);
      if (!event) {
        socket.emit('API_RESULT', 'No upcoming events in your area...');
      } else {
        socket.emit('API_RESULT', event);
      }
    } catch(e) {
      console.log(e);
    }
  });


  socket.on('SUBSCRIBE', async payload => {
    try {
      const newSub = await subs.create(payload); // payload : { username, type }
      console.log(newSub);
      socket.emit('API_RESULT', 'subscription successful');
    } catch(e) {
      console.log(e);
    }
  });

  socket.on('UNSUBSCRIBE', async payload => {
    try {
      const byeSub = await subs.destroy({
        where: {
          username: payload.username,
          type: payload.type,
        },
      });
      console.log(byeSub);
      socket.emit('API_RESULT', `unsubscribed from ${payload.type}`);
    } catch(e) {
      console.log(e);
    }
  });


  socket.on('disconnect', reason => {
    console.log('client disconnected');
    if(users[socket.id]) {
      const { username, room } = users[socket.id];
      socket.to(room).emit('NEW_LEAVE', `${username} has left the room`);
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


const start = async () => db.sync().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`listening on port: ${PORT}`);
  });
});

module.exports = {
  server: app,
  start,
};
