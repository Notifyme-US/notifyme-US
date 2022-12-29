'use strict';

require('dotenv').config();
const { io } = require('socket.io-client');
const chalk = require('chalk');
const inquirer = require('inquirer');

const local = true;
const SERVER = local ? process.env.SERVER_LOCAL : process.env.SERVER_DEPLOYED;
console.log('🚀 ~ file: index.js:10 ~ SERVER', SERVER);
const socket = io(`${SERVER}/chat`);

const authPrompt = require('./authPrompt')(socket, SERVER);
const roomPrompt = require('./roomPrompt')(socket, SERVER);
console.log('------------');

const session = {};

socket.on('connect', async () => {
  console.log('connected');

  const { username, rooms } = await authPrompt();
  session.username = username;
  session.roomList = rooms;

  session.room = await roomPrompt(session.roomList);

  socket.emit('JOIN', {
    username: session.username,
    room: session.room,
  });

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

socket.on('LEAVE', payload => {
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



async function messenger() {
  const answers = await inquirer.prompt([{
    type: 'input',
    name: 'input',
    message: '->',
  }]);
  const { input } = answers;
  if(input === '\\q') {
    return;
  }
  process.stdout.moveCursor(0, -1);
  process.stdout.write('\r\x1b[k');
  const payload = {
    content: input,
  };

  const re = /^!(?!!)/;
  if(re.test(input)) {
    const parsed = input.match(/[a-zA-Z0-9]+/g);
    const cmd = parsed[0].toLowerCase();
    const arg = parsed.length > 1 ? parsed[1] : '98034'; // TODO replace '98034' with dynamically pulled user location
    if (cmd === 'weather') {
      socket.emit('WEATHER', { zip: arg });
    }
    if (cmd === 'traffic') {
      socket.emit('TRAFFIC', arg);
    }
    if (cmd === 'events') {
      socket.emit('EVENTS', arg);
    }
    if (cmd === 'subscribe') {
      const options = ['weather', 'events'];
      if(!options.includes(arg)) {
        console.log('error: not an option for subscription');
        return messenger();
      }
      socket.emit('SUBSCRIBE', {
        username: session.username,
        type: arg,
      });
    }
    if (cmd === 'back') {
      return roomPrompt(session.roomList);
    }
  }
  socket.emit('MESSAGE', payload);
  messenger();
}
