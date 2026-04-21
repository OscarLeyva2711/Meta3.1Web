'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('tarea_tags', [
      // Tarea 1 (Implementar autenticación)
      {
        tarea_id: 1,
        tag_id: 2, // importante
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        tarea_id: 1,
        tag_id: 5, // feature
        created_at: new Date(),
        updated_at: new Date()
      },
      // Tarea 2 (Diseñar base de datos)
      {
        tarea_id: 2,
        tag_id: 2, // importante
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        tarea_id: 2,
        tag_id: 6, // documentación
        created_at: new Date(),
        updated_at: new Date()
      },
      // Tarea 3 (Corregir bug en login)
      {
        tarea_id: 3,
        tag_id: 1, // urgente
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        tarea_id: 3,
        tag_id: 4, // bug
        created_at: new Date(),
        updated_at: new Date()
      },
      // Tarea 4 (Crear API de tareas)
      {
        tarea_id: 4,
        tag_id: 2, // importante
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        tarea_id: 4,
        tag_id: 5, // feature
        created_at: new Date(),
        updated_at: new Date()
      },
      // Tarea 5 (Documentar endpoints)
      {
        tarea_id: 5,
        tag_id: 6, // documentación
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        tarea_id: 5,
        tag_id: 3, // revisión
        created_at: new Date(),
        updated_at: new Date()
      },
      // Tarea 6 (Realizar testing)
      {
        tarea_id: 6,
        tag_id: 2, // importante
        created_at: new Date(),
        updated_at: new Date()
      },
      // Tarea 7 (Optimizar queries)
      {
        tarea_id: 7,
        tag_id: 2, // importante
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        tarea_id: 7,
        tag_id: 3, // revisión
        created_at: new Date(),
        updated_at: new Date()
      },
      // Tarea 8 (Revisar código)
      {
        tarea_id: 8,
        tag_id: 3, // revisión
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('tarea_tags', null, {});
  }
};
