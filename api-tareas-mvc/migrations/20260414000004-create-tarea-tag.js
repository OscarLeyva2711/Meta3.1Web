'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tarea_tags', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tarea_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tareas',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      tag_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tags',
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

    // Crear índices para las foreign keys
    await queryInterface.addIndex('tarea_tags', ['tarea_id']);
    await queryInterface.addIndex('tarea_tags', ['tag_id']);
    // Crear índice único compuesto
    await queryInterface.addIndex('tarea_tags', ['tarea_id', 'tag_id'], { unique: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tarea_tags');
  }
};
