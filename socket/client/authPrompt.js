const inquirer = require('inquirer');
const base64 = require('base-64');
const axios = require('axios');


module.exports = (socket, SERVER) => async function authPrompt() {
  console.log('running authPrompt');
  const auth = {
    options: [
      {
        type: 'list',
        name: 'auth',
        message: 'select one...',
        choices: ['signin', 'signup'],
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
        name: 'zip',
        message: 'zip code: ',
      },
    ],
  };


  const optionAnswers = await inquirer.prompt(auth.options);
  const authRoute = optionAnswers.auth;

  //signin logic
  const authAnswers = await inquirer.prompt(auth[authRoute]);
  console.log('🚀 ~ file: authPrompt.js:68 ~ authPrompt ~ authAnswers', authAnswers);
  const { username, password } = authAnswers;

  if(authRoute === 'signin') {
    const encoded = base64.encode(`${username}:${password}`);
    console.log('🚀 ~ file: authPrompt.js:65 ~ authPrompt ~ encoded', encoded);
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
  }
  if(authRoute === 'signup') {
    const body = {};
    const keys = Object.keys(authAnswers);
    keys.forEach(key => {
      if(authAnswers[key]) {
        body[key] = authAnswers[key];
      }
    });

    console.log(body);
    try {
      const response = await axios.post(`${SERVER}/signup`, body);

    } catch(e) {
      console.log(e.message);
      return authPrompt();
    }

  }

  return username;
};
