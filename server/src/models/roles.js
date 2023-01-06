'use strict';

const rolesModel = (db, DataTypes) => {
  const model = db.define('Roles', {
    name: {
      type: DataTypes.STRING,
      required: true,
    },
    rooms: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      required: true,
    },
  });

  return model;
};

module.exports = rolesModel;
