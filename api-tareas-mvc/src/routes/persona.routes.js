/**
 * Rutas de Personas
 * Define los endpoints para gestionar personas y sus relaciones
 */

const express = require('express');
const personaController = require('../controllers/persona.controller');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);

// ============================================================================
// CRUD DE PERSONAS
// ============================================================================

// GET /api/personas - Obtener todas las personas
router.get('/', personaController.obtenerTodas);

// GET /api/personas/buscar - Buscar personas
router.get('/buscar', personaController.buscar);

// GET /api/personas/:id - Obtener una persona por ID
router.get('/:id', personaController.obtenerPorId);

// POST /api/personas - Crear una nueva persona
router.post('/', personaController.crear);

// PUT /api/personas/:id - Actualizar persona
router.put('/:id', personaController.actualizar);

// DELETE /api/personas/:id - Eliminar persona
router.delete('/:id', personaController.eliminar);

// ============================================================================
// RELACIONES - PERSONAS ↔ TAREAS Y TAGS
// ============================================================================

// GET /api/personas/:id/tareas - Obtener todas las tareas de una persona
router.get('/:id/tareas', personaController.obtenerTareas);

// GET /api/personas/:id/tags - Obtener todos los tags asociados a una persona (indirecto)
router.get('/:id/tags', personaController.obtenerTags);

module.exports = router;
