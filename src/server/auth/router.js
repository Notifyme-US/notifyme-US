'use strict';

const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const basicAuth = require('./middleware/basic');
const { Users } = require('./models/index');

router.post('/signup', async (req, res, next) => {
  try {
    let { username, password } = req.body;
    let encryptedPassword = await bcrypt.hash(password, 10);
    console.log('I am here', encryptedPassword);
    let record = await Users.create({
      username,
      password: encryptedPassword,
    });
    res.status(200).send(record);
  } catch (e) {
    next('Error Creating User', e);
  }
});

router.post('/signin', basicAuth, (req, res, next) => {
  res.status(200).send(req.user);
});

module.exports = router;


