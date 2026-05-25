'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('tareas', [
      {
        titulo: 'Implementar autenticación',
        descripcion: 'Crear sistema de login con JWT',
        estado: 'en_progreso',
        persona_id: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        titulo: 'Diseñar base de datos',
        descripcion: 'Crear esquema de BD para tareas',
        estado: 'completada',
        persona_id: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        titulo: 'Corregir bug en login',
        descripcion: 'El formulario no valida correctamente',
        estado: 'pendiente',
        persona_id: 2,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        titulo: 'Crear API de tareas',
        descripcion: 'Endpoints CRUD para tareas',
        estado: 'en_progreso',
        persona_id: 2,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        titulo: 'Documentar endpoints',
        descripcion: 'Crear documentación de API',
        estado: 'pendiente',
        persona_id: 3,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        titulo: 'Realizar testing',
        descripcion: 'Ejecutar suite de pruebas',
        estado: 'pendiente',
        persona_id: 3,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        titulo: 'Optimizar queries',
        descripcion: 'Mejorar rendimiento de búsquedas',
        estado: 'pendiente',
        persona_id: 4,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        titulo: 'Revisar código',
        descripcion: 'Code review del branch develop',
        estado: 'en_progreso',
        persona_id: 4,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('tareas', null, {});
  }
};
