'use strict';

require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');
const usersModel = require('./users-model');
// const { Users } = require('./models/index');

const DATABASE_URL = process.env.NODE_ENV === 'test'
  ? 'sqlite:memory'
  : process.env.DATABASE_URL;

const sequelizeDatabase = new Sequelize(DATABASE_URL);

const Users = usersModel(sequelizeDatabase, DataTypes);

module.exports = {
  sequelizeDatabase,
  Users,
  // Users: Users(sequelizeDatabase, DataTypes),
};
