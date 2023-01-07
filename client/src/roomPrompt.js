const inquirer = require('inquirer');
const chalk = require('chalk');

module.exports = (socket, session) => async function roomPrompt() {
  const rooms = [
    {
      type: 'list',
      name: 'room',
      message: 'Which room would you like to join?',
      choices: session.roomList,
    },
  ];

  const answers = await inquirer.prompt(rooms);
  const room = answers.room;
  
  console.clear();

  socket.emit('JOIN', {
    username: session.username,
    room: room,
  });

  if(room === 'Commands'){
    console.log(chalk.blueBright('Welcome to Commands! Please take a look at what you can do with some of our examples.'))
  }

  if(room === 'Commands'){
    console.log(chalk.grey('Example Commands: \n !back - Return to Menu \n !subscribe <options : weather or events > - Subsrcibe to daily email notifcations for inputed option \n !unsubscribe <options : weather or events > - Unubsrcibe to daily email notifcations for inputed option \n !weather - Receive 5 Day forecast for your area \n !weather <Zip Code> - Receive 5 Day forecast for another zip code \n !current_weather - Receive Current weather for your area \n !current_weather <Zip Code> - Receive Current weather for another zip code \n !events <nearest major city> <two character state code> - Receive 5 events in the upcoming week for that area \n !traffic <starting address seperated by underscores> <destination address seperated by underscores> - Receive Traffic info and best route to your destination from starting point \n \n '))
  }

  if(room === 'General Chat'){
    console.log(chalk.greenBright('Welcome to General Chat! Here you can talk to other Travelers.'))
  }

  if(room === 'Questions'){
    console.log(chalk.magentaBright('Welcome to Questions! Here you ask your fellows travelers what ever questions you might have.'))
  }

  if(room === 'Support'){
    console.log(chalk.yellowBright('Welcome to Support! Here you can ask our wonderful support team about any questions about our application you may have.'))
  }

  if(room === 'Admin'){
    console.log(chalk.redBright('Welcome Admins! Here you chat with other Admins and discuss needs for our app.'))
  }

  if(room === 'Mod'){
    console.log(chalk.cyanBright('Welcome Moderators! Here you chat with other Moderators and discuss needs for our app.'))
  }
  session.room = room;
  return room;
};
