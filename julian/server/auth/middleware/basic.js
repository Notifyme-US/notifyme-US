'use strict';

const base64 = require('base-64');

const { users } = require('../../models');

module.exports = async (req, res, next) => {
  if(!req.headers.authorization) {
    res.status(403).send('Invalid Login');
  }
  let basic = req.headers.authorization.split(' ').pop();
  let [user, pass] = base64.decode(basic).split(':');
  try {
    console.log('calling users.authBasic');
    req.user = await users.authBasic(user, pass);
    next();
  } catch (e) {
    console.log(e.message);
    res.status(403).send();
    // res.status(403).send('Invalid Login');
  }
};
