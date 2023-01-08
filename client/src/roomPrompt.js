const inquirer = require('inquirer');
const chalk = require('chalk');

module.exports = (socket, session) => async function roomPrompt() {
  const rooms = [
    {
      type: 'list',
      name: 'room',
      message: `\nGlad to have you here, ${session.username}!\n\nWhich room would you like to join?\n`,
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
    console.log(chalk.grey('Example Commands: \n !back - Return to Menu \n \n !weather [zip] - Receive 5 Day forecast for your area or a specified zip code\n !current_weather [zip] - Receive Current weather for your area \n !events <nearest major city> <two character state code> - Receive 5 events in the upcoming week for that area \n !traffic <starting_address> <destination_address> - Receive Traffic info and best route between two points\n \n !subscribe <options : weather or events > - Subsrcibe to daily email notifcations for inputed option \n !unsubscribe <options : weather or events > - Unubsrcibe to daily email notifcations for inputed option \n'))
  }

  if(room === 'General Chat'){
    console.log(chalk.greenBright('Welcome to General Chat! Here you can talk to other travel enthusiasts. Please be respectful to others.\n\nEnter !back to return to the main menu at any time.\n'))
  }

  if(room === 'Questions'){
    console.log(chalk.magentaBright('Welcome to Questions! Here you ask other folks whatever questions you might have about traveling.\n\nEnter !back to return to the main menu at any time.\n'))
  }

  if(room === 'Support'){
    console.log(chalk.yellowBright('Welcome to Support! Here you can ask our wonderful support team about any questions about our application you may have. Please be warned that this is not a 24/7 service. (More like 1/1, on a good day...)\n\nEnter !back to return to the main menu at any time.\n'))
  }

  if(room === 'Admin'){
    console.log(chalk.redBright('Welcome, Admins! Here you chat with other Admins and discuss needs for our app.\n\nEnter !back to return to the main menu at any time.\n'))
  }

  if(room === 'Mod'){
    console.log(chalk.cyanBright('Welcome Moderators! Here you chat with other Moderators and discuss bringing down the ban hammer on unsuspecting members.\n\nEnter !back to return to the main menu at any time.\n'))
  }
  session.room = room;
  return room;
};
