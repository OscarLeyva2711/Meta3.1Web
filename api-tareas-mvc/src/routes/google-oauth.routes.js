/**
 * Rutas de autenticación con Google OAuth
 */

const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

/**
 * GET /api/auth/google/login
 * Inicia el flujo de autenticación con Google
 */
router.get('/google/login', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

/**
 * GET /api/auth/google/callback
 * Callback de Google después de la autenticación
 */
router.get('/google/callback', 
  passport.authenticate('google', { 
    session: false,
    failureRedirect: 'https://localhost:5173/login?error=authentication_failed'
  }),
  (req, res) => {
    try {
      // Generar JWT con información del usuario
      const token = jwt.sign(
        { 
          id: req.user.id, 
          email: req.user.email, 
          rol: req.user.rol,
          googleId: req.user.googleId 
        },
        process.env.JWT_SECRET || 'tu_secreto_aqui',
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      // Redirigir al frontend con el token
      // En desarrollo: http://localhost:5173
      // En producción: https://tudominio.com
      const frontendURL = process.env.FRONTEND_URL || 'https://localhost:5173';
      const callbackURL = `${frontendURL}/oauth-callback?token=${encodeURIComponent(token)}&email=${encodeURIComponent(req.user.email)}`;
      
      console.log('=== REDIRECCIÓN OAUTH ===');
      console.log('Token:', token.substring(0, 30) + '...');
      console.log('Email:', req.user.email);
      console.log('URL Completa:', callbackURL);
      res.redirect(callbackURL);
    } catch (error) {
      console.error('Error en callback de Google:', error);
      const frontendURL = process.env.FRONTEND_URL || 'https://localhost:5173';
      res.redirect(`${frontendURL}/login?error=authentication_failed`);
    }
  }
);

/**
 * GET /api/auth/google/info
 * Obtener información del usuario autenticado
 */
router.get('/google/info', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No hay token proporcionado'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_secreto_aqui');
    res.json({
      success: true,
      data: {
        id: decoded.id,
        email: decoded.email,
        rol: decoded.rol,
        googleId: decoded.googleId
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token inválido o expirado'
    });
  }
});

module.exports = router;
