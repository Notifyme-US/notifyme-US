'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    await queryInterface.bulkInsert('Roles', [
      {
        name: 'admin',
        rooms: ['Admin', 'Mod', 'General Chat', 'Questions', 'Support', 'Commands'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'mod',
        rooms: ['Mod', 'General Chat', 'Questions', 'Support', 'Commands'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'member',
        rooms: ['General Chat', 'Questions', 'Support', 'Commands'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Roles', null, {});
  },
};
