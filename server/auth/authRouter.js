'use strict';

const express = require('express');
const authRouter = express.Router();

const { users, roles } = require('../models');
console.log('🚀 ~ file: authRouter.js:7 ~ users', users);

const basicAuth = require('./middleware/basic');
// const bearerAuth = require('./middleware/bearer');

authRouter.post('/signup', handleSignup);
authRouter.post('/signin', basicAuth, handleSignin);
// authRouter.get('/users', bearerAuth, handleGetUsers);

async function handleSignup(req, res, next) {
  try {
    const userInfo = req.body;
    userInfo.role = 'member';
    const user = await users.create(userInfo);
    console.log('🚀 ~ file: authRouter.js:21 ~ handleSignup ~ user', user);
    const userRole = await roles.findOne({ where: { name: user.role } });
    const rooms = userRole.rooms;
    const output = {
      rooms,
      username: user.username,
      zip: user.zip,
    };
    res.status(201).json(output);
  } catch (e) {
    next(e);
  }
}

async function handleSignin(req, res, next) {
  console.log('handle signin');
  const { user } = req;
  const userRole = await roles.findOne({ where: { name: user.role } });
  const rooms = userRole.rooms;
  const output = {
    rooms,
    username: user.username,
    zip: user.zip,
  };
  res.status(200).json(output);
}

// async function handleGetUsers(req, res, next) {
//   const results = await users.findAll({});
//   const list = results.map(user => user.username);
//   res.status(200).json(list);
// }

module.exports = authRouter;
