' use strict';

const { Sequelize, DataTypes } = require('sequelize');
const userModel = require('./users');
const rolesModel = require('./roles');

const DATABASE_URL = process.env.DATABASE_URL || 'sqlite:memory;';
console.log('🚀 ~ file: index.js:7 ~ DATABASE_URL', DATABASE_URL);

const db = new Sequelize(DATABASE_URL);
const users = userModel(db, DataTypes);
const roles = rolesModel(db, DataTypes);

module.exports = {
  db,
  users,
  roles,
};
