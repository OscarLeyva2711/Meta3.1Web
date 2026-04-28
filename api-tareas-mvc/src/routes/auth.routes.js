/**
 * Rutas de autenticación
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyApiKey, authenticateToken } = require('../middleware/auth');

/**
 * POST /api/auth/login
 * Iniciar sesión - requiere API Key
 */
router.post('/login', verifyApiKey, authController.login);

/**
 * POST /api/auth/logout
 * Cerrar sesión - requiere autenticación JWT
 */
router.post('/logout', authenticateToken, authController.logout);

/**
 * GET /api/auth/verify
 * Verificar estado de autenticación - soporta JWT y sesión
 */
router.get('/verify', authController.verify);

module.exports = router;
