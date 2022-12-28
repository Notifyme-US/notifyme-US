'use strict';

const router = require('express').Router();

const { users, roles } = require('../models');
console.log('🚀 ~ file: authRouter.js:7 ~ users', users);

const bearerAuth = require('./middleware/bearer');

router.route('/users')
  .get(bearerAuth, handleGetUsers)
  .post()
  .put();

router.route('/roles')
  .get()
  .post()
  .put();

async function handleGetUsers(req, res, next) {
  const results = await users.findAll({});
  const list = results.map(user => user.username);
  res.status(200).json(list);
}

module.exports = router;
