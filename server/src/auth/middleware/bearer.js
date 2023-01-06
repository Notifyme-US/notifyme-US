'use strict';


const { users } = require('../../models');

module.exports = async (req, res, next) => {


  if(!req.headers.authorization) {
    res.status(403).send('Invalid Login');
  }
  let token = req.headers.authorization.split(' ').pop();
  console.log(token);
  try {
    let user = await users.authToken(token);
    req.user = user;
    req.token = user.token;
    next();
  } catch (e) {
    res.status(403);
  }
};
