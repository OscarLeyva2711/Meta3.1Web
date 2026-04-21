'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tareas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      titulo: {
        type: Sequelize.STRING,
        allowNull: false
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      estado: {
        type: Sequelize.ENUM('pendiente', 'en_progreso', 'completada'),
        defaultValue: 'pendiente'
      },
      persona_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'personas',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    // Crear índice para persona_id
    await queryInterface.addIndex('tareas', ['persona_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tareas');
  }
};
