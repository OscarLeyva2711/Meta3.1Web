'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    const email = 'admin@test.local';
    const [usuarios] = await queryInterface.sequelize.query(
      'SELECT id FROM usuarios WHERE email = ? LIMIT 1',
      { replacements: [email] }
    );

    const password = await bcrypt.hash('AdminPass1234', 10);

    if (usuarios.length) {
      await queryInterface.bulkUpdate('usuarios', {
        nombre: 'Administrador',
        password,
        rol: 'admin',
        activo: true,
        updated_at: new Date()
      }, { email });
      return;
    }

    await queryInterface.bulkInsert('usuarios', [{
      nombre: 'Administrador',
      email,
      password,
      activo: true,
      rol: 'admin',
      created_at: new Date(),
      updated_at: new Date()
    }]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('usuarios', { email: 'admin@test.local' });
  }
};
