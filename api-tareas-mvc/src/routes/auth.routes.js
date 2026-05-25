/**
 * Rutas de autenticación
 */

import express from 'express';
const router = express.Router();
import authController from '../controllers/auth.controller.js';
import { verifyApiKey, authenticateToken } from '../middleware/auth.js';

/**
 * POST /api/auth/register
 * Registrar un nuevo usuario
 */
router.post('/register', authController.register);

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

export default router;
