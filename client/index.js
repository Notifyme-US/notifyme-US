#!/usr/bin/env node

'use strict';

require('dotenv').config();
const { io } = require('socket.io-client');
const chalk = require('chalk');

// const SERVER = process.env.SERVER_LOCAL;
const SERVER = 'http://notifyme.us-west-2.elasticbeanstalk.com';

// console.log('🚀 ~ file: index.js:10 ~ SERVER', SERVER);
const socket = io(`${SERVER}/chat`);

const session = {};

const authPrompt = require('./src/authPrompt')(socket, SERVER);
const roomPrompt = require('./src/roomPrompt')(socket, SERVER, session);
const messenger = require('./src/messenger')(socket, session, roomPrompt);

socket.on('connect', async () => {
  console.clear();
  console.log('connected');

  const { username, rooms, zip } = await authPrompt();
  session.username = username;
  session.roomList = rooms;
  session.userZip = zip;

  await roomPrompt(session.roomList);

  messenger();
});

socket.on('MESSAGE', payload => {
  const { username, content } = payload;
  process.stdout.moveCursor(0, -1);
  process.stdout.write('\r\x1b[k');

  console.log('\n', chalk.cyan(`${username}:`), content);
});

socket.on('RECEIVED', payload => { // string saying message received
  const { content } = payload;
  process.stdout.moveCursor(0, -1);
  process.stdout.write('\r\x1b[k');
  console.log('\n', chalk.green('Me:'), content);
});

socket.on('NEW_LEAVE', payload => {
  console.log('\n\t', chalk.magenta(payload));
});

socket.on('NEW_JOIN', payload => {
  console.log('\n\t', chalk.grey(payload));
});

socket.on('disconnect', () => {
  console.log('\n\tForcibly disconnected from server');
  process.exit();
});

socket.on('API_RESULT', payload => {
  console.log(payload);
});
