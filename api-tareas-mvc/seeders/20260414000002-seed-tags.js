'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('tags', [
      {
        nombre: 'urgente',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'importante',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'revisión',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'bug',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'feature',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'documentación',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('tags', null, {});
  }
};
