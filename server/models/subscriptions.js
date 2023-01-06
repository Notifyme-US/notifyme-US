'use strict';

const subModel = (db, DataTypes) => {
  const model = db.define('Subscriptions', {
    username: {
      type: DataTypes.STRING,
      required: true,
    },
    type: {
      type: DataTypes.ENUM(['weather', 'events']),
      required: true,
    },
  });

  return model;
};

module.exports = subModel;
