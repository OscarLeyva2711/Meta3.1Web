/**
 * Rutas de autenticación con Google OAuth
 */

import express from 'express';
import passport from 'passport';
const router = express.Router();
import { googleLogin, googleCallback } from '../controllers/googleAuth.controller.js';

/**
 * GET /api/auth/google/login
 * Iniciar flujo de autenticación con Google
 */
router.get('/login', googleLogin);

/**
 * GET /api/auth/google/callback
 * Callback para manejar la respuesta de Google OAuth
 */
router.get('/callback', googleCallback);

export default router;
