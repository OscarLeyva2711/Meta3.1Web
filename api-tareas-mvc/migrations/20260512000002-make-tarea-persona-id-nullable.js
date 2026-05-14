'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      'ALTER TABLE `tareas` MODIFY `persona_id` INTEGER NULL;'
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      'ALTER TABLE `tareas` MODIFY `persona_id` INTEGER NOT NULL;'
    );
  }
};
