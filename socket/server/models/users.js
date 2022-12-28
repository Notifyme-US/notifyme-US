'use stric';

const bcrypt = require('bcrypt');

const userModel = (db, DataTypes) => {
  const model = db.define('Users', {
    username: {
      type: DataTypes.STRING,
      required: true,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      required: true,
    },
    role: {
      type: DataTypes.STRING,
      required: true,
    },
    name: {
      type: DataTypes.STRING,
      required: false,
    },
    phone: {
      type: DataTypes.STRING,
      required: true,
    },
    email: {
      type: DataTypes.STRING,
      required: true,
    },
    zip: {
      type: DataTypes.STRING,
      required: true,
    },
  });

  model.beforeCreate( async (user) => {
    let hashedPass = await bcrypt.hash(user.password, 10);
    user.password = hashedPass;
    console.log('User: ', user);
  });

  model.authBasic = async function (username, password)  {
    const user = await this.findOne({ where: { username }});
    console.log('🚀 ~ file: users.js:43 ~ user', user);
    if(!user) throw new Error('Invalid User');
    const valid = await bcrypt.compare(password, user.password);
    console.log('🚀 ~ file: users.js:45 ~ valid', valid);
    if(valid) {
      return user;
    }
    throw new Error('Invalid User');
  };

  return model;
};

module.exports = userModel;
