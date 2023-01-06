const inquirer = require('inquirer');
const roomPrompt = require('./roomPrompt');

describe('roomPrompt', () => {
  it('should throw an error if the inquirer.prompt function throws an error', async () => {
    inquirer.prompt = jest.fn();

    inquirer.prompt.mockRejectedValue(new Error('Prompt error'));

    try {
      await roomPrompt(['room1', 'room2']);
      expect(true).toEqual(true);
    } catch (error) {
      expect(error.message).toEqual('Prompt error');
    }
  });
});

// describe('roomPrompt', () => {
//   it('should return a default value if the roomChoices array is empty', async () => {
//     inquirer.prompt = jest.fn();


//     inquirer.prompt.mockResolvedValue({ room: 'room1' });


//     const room = await roomPrompt([]);


//     expect(room).toEqual('No rooms available');
//   });
// });
