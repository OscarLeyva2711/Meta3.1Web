/**
 * Rutas de autenticación con Google OAuth
 */

const express = require('express');
const passport = require('passport');
const router = express.Router();
const { googleLogin, googleCallback } = require('../controllers/googleAuth.controller');

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

module.exports = router;
