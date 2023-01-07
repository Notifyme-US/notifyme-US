const inquirer = require('inquirer');
const base64 = require('base-64');
const axios = require('axios');


module.exports = (SERVER) => async function authPrompt() {
  const auth = {
    options: [
      {
        type: 'list',
        name: 'auth',
        message: 'select one...',
        choices: ['signin', 'signup', 'cancel'],
      },
    ],
    signin: [
      {
        type: 'input',
        name: 'username',
        message: 'username: ',
      },
      {
        type: 'password',
        name: 'password',
        message: 'password: ',
      },
    ],
    signup: [
      {
        type: 'input',
        name: 'username',
        message: 'create a username: ',
      },
      {
        type: 'password',
        name: 'password',
        message: 'create a password: ',
      },
      {
        type: 'input',
        name: 'name',
        message: 'name: ',
      },
      {
        type: 'input',
        name: 'email',
        message: 'email: ',
      },
      {
        type: 'input',
        name: 'phone',
        message: 'phone number: ',
      },
      {
        type: 'input',
        name: 'city',
        message: 'city: ',
      },
      {
        type: 'input',
        name: 'state',
        message: 'state: ',
      },
      {
        type: 'input',
        name: 'zip',
        message: 'zip code: ',
      },
    ],
  };


  const optionAnswers = await inquirer.prompt(auth.options);
  const authRoute = optionAnswers.auth;

  //signin logic
  const authAnswers = await inquirer.prompt(auth[authRoute]);
  const { username, password } = authAnswers;
  
  if(authRoute === 'cancel') {
    return null;
  }

  if(authRoute === 'signin') {
    try {
      const encoded = base64.encode(`${username}:${password}`);
      const response = await axios.post(`${SERVER}/signin`,{}, {
        headers: {
          Authorization: `Basic ${encoded}`,
        },
      });
      console.log(`Status: ${response.status}`);
      if(response.status !== 200) {
        console.log('Invalid Login\n\n');
        return authPrompt();
      }
      return response.data;
    } catch(e) {
      console.log('Invalid Login\n\n');
      return authPrompt();
    }
  }
  if(authRoute === 'signup') {
    const body = {};
    const keys = Object.keys(authAnswers);
    keys.forEach(key => {
      if(authAnswers[key]) {
        body[key] = authAnswers[key];
      }
    });

    try {
      const response = await axios.post(`${SERVER}/signup`, body);
      return response.data;
    } catch(e) {
      console.log(e.message);
      return authPrompt();
    }
  }

  return username;
};
