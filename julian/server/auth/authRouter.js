'use strict';

const express = require('express');
const authRouter = express.Router();

const { users } = require('../models');
console.log('🚀 ~ file: authRouter.js:7 ~ users', users);

const basicAuth = require('./middleware/basic');

authRouter.post('/signup', handleSignup);
authRouter.post('/signin', basicAuth, handleSignin);
authRouter.get('/users', handleGetUsers);

async function handleSignup(req, res, next) {
  try {
    const userInfo = req.body;
    userInfo.roles = ['member'];
    const user = await users.create(userInfo);
    console.log('🚀 ~ file: authRouter.js:21 ~ handleSignup ~ user', user);
    res.status(201).json(user);
  } catch (e) {
    next(e);
  }
}

async function handleSignin(req, res, next) {
  const output = {user: req.user, token: req.user.token};
  console.log('handle signin');
  res.status(200).json(output);
}

async function handleGetUsers(req, res, next) {
  const results = await users.findAll({});
  const list = results.map(user => user.username);
  res.status(200).json(list);
}

module.exports = authRouter;
