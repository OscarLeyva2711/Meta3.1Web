/**
 * Rutas de Usuarios
 * Define los endpoints para autenticación y gestión de usuarios
 */

const express = require('express');
const usuarioController = require('../controllers/usuario.controller');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// ============================================================================
// AUTENTICACIÓN (Sin requerir token)
// ============================================================================

// POST /api/usuarios/registro - Registrar nuevo usuario
router.post('/registro', usuarioController.registro);

// POST /api/usuarios/login - Login
router.post('/login', usuarioController.login);

// ============================================================================
// CRUD Y GESTIÓN DE USUARIOS (Requieren autenticación)
// ============================================================================

// Aplicar middleware de autenticación desde aquí
router.use(authenticateToken);

// GET /api/usuarios - Obtener todos los usuarios
router.get('/', usuarioController.obtenerTodos);

// GET /api/usuarios/buscar - Buscar usuarios
router.get('/buscar', usuarioController.buscar);

// GET /api/usuarios/:id - Obtener usuario por ID
router.get('/:id', usuarioController.obtenerPorId);

// PUT /api/usuarios/:id - Actualizar usuario
router.put('/:id', usuarioController.actualizar);

// PUT /api/usuarios/:id/password - Cambiar contraseña
router.put('/:id/password', usuarioController.cambiarPassword);

// DELETE /api/usuarios/:id - Eliminar usuario
router.delete('/:id', usuarioController.eliminar);

// ============================================================================
// ACTIVACIÓN Y DESACTIVACIÓN
// ============================================================================

// PATCH /api/usuarios/:id/activar - Activar usuario
router.patch('/:id/activar', usuarioController.activar);

// PATCH /api/usuarios/:id/desactivar - Desactivar usuario
router.patch('/:id/desactivar', usuarioController.desactivar);

module.exports = router;
