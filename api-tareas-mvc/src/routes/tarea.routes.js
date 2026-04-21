/**
 * Rutas de Tareas
 * Define los endpoints de la API
 */

const express = require('express');
const tareaController = require('../controllers/tarea.controller');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas de tareas
router.use(authenticateToken);

// ============================================================================
// CRUD DE TAREAS
// ============================================================================

// GET /api/tareas - Obtener todas las tareas
router.get('/', tareaController.obtenerTodas);

// GET /api/tareas/buscar?titulo= - Buscar tareas por título
router.get('/buscar', tareaController.buscarPorTitulo);

// GET /api/tareas/:id - Obtener una tarea por ID
router.get('/:id', tareaController.obtenerPorId);

// POST /api/tareas - Crear una nueva tarea
router.post('/', tareaController.crear);

// PUT /api/tareas/:id - Actualizar tarea completamente
router.put('/:id', tareaController.actualizarCompleta);

// PATCH /api/tareas/:id - Actualizar tarea parcialmente
router.patch('/:id', tareaController.actualizarParcial);

// DELETE /api/tareas/:id - Eliminar una tarea
router.delete('/:id', tareaController.eliminar);

// ============================================================================
// RELACIONES - TAREAS ↔ TAGS
// ============================================================================

// GET /api/tareas/:id/tags - Obtener todos los tags de una tarea
router.get('/:id/tags', tareaController.obtenerTags);

// POST /api/tareas/:id/tags/:tagId - Asignar un tag a una tarea
router.post('/:id/tags/:tagId', tareaController.asignarTag);

// DELETE /api/tareas/:id/tags/:tagId - Desasignar un tag de una tarea
router.delete('/:id/tags/:tagId', tareaController.desasignarTag);

module.exports = router;