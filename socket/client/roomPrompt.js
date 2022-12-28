const inquirer = require('inquirer');

module.exports = (socket, SERVER) => async function roomPrompt(roomChoices) {
  const rooms = [
    {
      type: 'list',
      name: 'room',
      message: 'Which room would you like to join?',
      choices: roomChoices,
    },
  ];

  const answers = await inquirer.prompt(rooms);
  const room = answers.room;

  return room;
};
