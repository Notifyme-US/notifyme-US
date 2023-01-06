
const inquirer = require('inquirer');

const messengerCtor = (socket, session, roomPrompt) => (async function messenger() {
  const answers = await inquirer.prompt([{
    type: 'input',
    name: 'input',
    message: '->',
  }]);
  const { input } = answers;
  if(input === '\\q') {
    process.exit();
    return;
  }
  process.stdout.moveCursor(0, -1);
  process.stdout.write('\r\x1b[k');
  const payload = {
    content: input,
  };

  const re = /^!(?!!)/;
  if(re.test(input)) {
    const parsed = input.match(/[\w]+/g);
    if(!parsed) {
      console.log(`Invalid command... (you typed "${input}")`);
      return messenger();
    }
    const cmd = parsed[0].toLowerCase();
    const arg = parsed.length > 1 ? parsed.slice(1) : session.userZip;
    if (cmd === 'weather') {
      socket.emit('WEATHER', { zip: arg });
    } else if (cmd === 'current_weather') {
      socket.emit('CURRENT_WEATHER', { zip: arg });
    } else if (cmd === 'traffic') {
      if(arg.length < 2) {
        console.log('Command requires 2 arguments');
      } else {        
        const payload = {
        firstAddress: arg[0], 
        secondAddress: arg[1],
      };
        socket.emit('TRAFFIC', payload);
      }
    } else if (cmd === 'events') {
      if(arg.length < 2) {
        console.log('Command requires 2 arguments');
      } else {
        const payload = {
          cityName: arg[0],
          state: arg[1],
        };
        console.log(payload);
        socket.emit('EVENTS', payload);
      }
    } else if (cmd === 'subscribe') {
      const options = ['weather', 'events'];
      if(!options.includes(arg[0])) {
        console.log('error: not an option for subscription');
        return messenger();
      }
      socket.emit('SUBSCRIBE', {
        username: session.username,
        type: arg[0],
      });
    } else if (cmd === 'unsubscribe') {
      const options = ['weather', 'events'];
      if(!options.includes(arg[0])) {
        console.log('error: not an option for unsubscription');
        return messenger();
      }
      socket.emit('UNSUBSCRIBE', {
        username: session.username,
        type: arg[0],
      });
    } else if (cmd === 'back') {
      socket.emit('LEAVE');
      console.clear();
      await roomPrompt();
      return messenger();
    } else {
      console.log(`Invalid command... (you typed "${input}")`);
      return messenger();
    }
  }
  if(session.room !== 'Commands') {
    socket.emit('MESSAGE', payload);
  }
  messenger();
});

module.exports = messengerCtor;