'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('tareas', 'usuario_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'usuarios',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.changeColumn('tareas', 'persona_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'personas',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addIndex('tareas', ['usuario_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('tareas', ['usuario_id']);
    await queryInterface.removeColumn('tareas', 'usuario_id');

    await queryInterface.changeColumn('tareas', 'persona_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'personas',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  }
};
