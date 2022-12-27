'use strict';

const { db } = require('./src/auth/models/index');
db.sync()
  .then(() => {


    require('./src/server.js').start(process.env.PORT);
  });

