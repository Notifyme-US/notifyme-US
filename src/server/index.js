'use strict';

require('dotenv').config();
const { Server } = require('socket.io');
const PORT = process.env.PORT || 3002;
const Queue = require('./lib/queue');
const server = new Server(PORT);
const caps = server.of('/caps');
const messageQueue = new Queue();

caps.on('connection', (socket) => {
  socket.onAny((event, payload) => {
    const time = new Date();
    console.log('EVENT', {event, time, payload});
  });
  socket.on('JOIN', (id) => {
    console.log('These are the rooms', socket.rooms);
    socket.join(id);
    console.log('Joined the room: ', id);
    socket.emit('JOIN', id);
  });

  socket.on('PICKUP', (payload) => {

    let currentQueue = messageQueue.read(payload.driverId);
    if(!currentQueue){
      let queueKey = messageQueue.store(payload.driverId, new Queue());
      currentQueue = messageQueue.read(queueKey);
    }
    currentQueue.store(payload.messageId, payload);
    socket.broadcast.emit('PICKUP', payload);
  });

  socket.on('IN-TRANSIT', (payload) => {
    socket.broadcast.emit('IN_TRANSIT', payload);
  });

  socket.on('DELIVERED', (payload) => {
    console.log('Driver: has delivered order');
    let currentQueue = messageQueue.read(payload.vendorId);
    if(!currentQueue){
      let queueKey = messageQueue.store(payload.vendorId, new Queue());
      currentQueue = messageQueue.read(queueKey);
    }
    currentQueue.store(payload.messageId, payload);
    socket.to(payload.vendorId).emit('DELIVERED', payload);
  });

  socket.on('RECEIVED', (payload) => {
    let currentQueue = messageQueue.read(payload.id);
    if(!currentQueue){
      throw new Error('no vendor queue present');
    }
    currentQueue.remove(payload.messageId);
  });

  socket.on('GET_ALL', (payload) => {
    let currentQueue = messageQueue.read(payload.id);
    if(currentQueue && currentQueue.data){
      Object.keys(currentQueue.data).forEach(message => {
        if(payload.id !== 'rPS'){
          socket.emit('DELIVERED', currentQueue.read(message));
        } else {
          socket.emit('PICKUP', currentQueue.read(message));
        }
      });
    }
  });

});


