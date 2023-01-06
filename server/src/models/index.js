' use strict';

const { Sequelize, DataTypes } = require('sequelize');
const userModel = require('./users');
const rolesModel = require('./roles');
const subModel = require('./subscriptions');

const DATABASE_URL = process.env.NODE_ENV === 'test' ? 'sqlite::memory' : process.env.DATABASE_URL;
console.log('🚀 ~ file: index.js:7 ~ DATABASE_URL', DATABASE_URL);

const db = new Sequelize(DATABASE_URL);
const users = userModel(db, DataTypes);
const roles = rolesModel(db, DataTypes);
const subs = subModel(db, DataTypes);

module.exports = {
  db,
  users,
  roles,
  subs,
};
