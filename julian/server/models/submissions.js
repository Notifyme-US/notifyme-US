'use strict';

const submissionModel = (db, DataTypes) => {
  const model = db.define('Submissions', {
    name: {
      type: DataTypes.STRING, required: true, unique: true,
    },
    date: {
      type: DataTypes.DATE, defaulValue: DataTypes.NOW, required: true,
    },
    assignment: {
      type: DataTypes.INTEGER, required: true,
    },
    body: {
      type: DataTypes.STRING, required: true,
    },
  });
  return model;
};

module.exports = submissionModel;
