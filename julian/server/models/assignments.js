'use strict';

const assignmentModel = (db, DataTypes) => {
  const model = db.define('Assignments', {
    name: {
      type: DataTypes.STRING, required: true, unique: true,
    },
    due_date: {
      type: DataTypes.STRING, required: true,
    },
    scope: {
      type: DataTypes.STRING, required: true,
    },
  });
  return model;
};

module.exports = assignmentModel;
