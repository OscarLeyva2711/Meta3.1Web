/**
 * Rutas de Tags
 * Define los endpoints para gestionar tags y sus relaciones
 */

const express = require('express');
const tagController = require('../controllers/tag.controller');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);

// ============================================================================
// CRUD DE TAGS
// ============================================================================

// GET /api/tags - Obtener todos los tags
router.get('/', tagController.obtenerTodos);

// GET /api/tags/buscar - Buscar tags
router.get('/buscar', tagController.buscar);

// GET /api/tags/:id - Obtener un tag por ID
router.get('/:id', tagController.obtenerPorId);

// POST /api/tags - Crear un nuevo tag
router.post('/', tagController.crear);

// PUT /api/tags/:id - Actualizar tag
router.put('/:id', tagController.actualizar);

// DELETE /api/tags/:id - Eliminar tag
router.delete('/:id', tagController.eliminar);

// ============================================================================
// RELACIONES - TAGS ↔ TAREAS Y PERSONAS
// ============================================================================

// GET /api/tags/:id/tareas - Obtener todas las tareas de un tag
router.get('/:id/tareas', tagController.obtenerTareas);

// GET /api/tags/:id/personas - Obtener todas las personas asociadas a un tag (indirecto)
router.get('/:id/personas', tagController.obtenerPersonas);

module.exports = router;
