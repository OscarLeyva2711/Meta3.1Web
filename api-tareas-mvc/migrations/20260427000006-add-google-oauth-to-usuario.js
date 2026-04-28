'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Agregar columnas para Google OAuth al modelo Usuario
     */
    await queryInterface.addColumn('usuarios', 'google_id', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true
    });

    await queryInterface.addColumn('usuarios', 'foto', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // Hacer password nullable para usuarios OAuth
    await queryInterface.changeColumn('usuarios', 'password', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Revertir cambios
     */
    await queryInterface.removeColumn('usuarios', 'google_id');
    await queryInterface.removeColumn('usuarios', 'foto');
    
    // Restaurar password como obligatorio
    await queryInterface.changeColumn('usuarios', 'password', {
      type: Sequelize.STRING,
      allowNull: false
    });
  }
};
