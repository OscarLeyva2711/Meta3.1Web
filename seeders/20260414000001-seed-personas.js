'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('personas', [
      {
        nombre: 'Juan García',
        email: 'juan.garcia@example.com',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'María López',
        email: 'maria.lopez@example.com',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'Carlos Rodríguez',
        email: 'carlos.rodriguez@example.com',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'Ana Martínez',
        email: 'ana.martinez@example.com',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('personas', null, {});
  }
};
