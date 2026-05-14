/**
 * Controlador de Google OAuth.
 * El JWT generado tras el callback NO incluye csrfToken: el frontend lo
 * recibe en la URL y lo guarda en localStorage; los siguientes requests lo
 * envían como Authorization Bearer (no aplica CSRF en este flujo).
 */

const passport = require('passport');
const jwt = require('jsonwebtoken');

const googleLogin = (req, res, next) => {
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    accessType: 'offline',
    prompt: 'consent'
  })(req, res, next);
};

const googleCallback = (req, res, next) => {
  console.log('=== GOOGLE OAUTH CALLBACK RECIBIDO ===');
  console.log('URL completa:', req.originalUrl);

  passport.authenticate('google', (err, user, info) => {
    const clientUrl = process.env.CLIENT_URL || 'https://localhost:5173';

    if (err) {
      console.error('Error en Google OAuth callback:', err);
      return res.redirect(`${clientUrl}/login?error=auth_error`);
    }
    if (!user) {
      console.error('Usuario no encontrado en Google OAuth callback');
      console.error('Info de Passport:', info);
      return res.redirect(`${clientUrl}/login?error=no_user`);
    }

    try {
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          rol: user.rol || 'usuario',
          googleId: user.googleId
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      const callbackURL = `${clientUrl}/oauth-callback`
        + `?token=${encodeURIComponent(token)}`
        + `&email=${encodeURIComponent(user.email)}`;

      console.log('✅ Usuario autenticado exitosamente:', user.email);
      console.log('✅ Token generado:', token.substring(0, 30) + '...');

      return res.redirect(callbackURL);
    } catch (error) {
      console.error('Error generando JWT:', error);
      return res.redirect(`${clientUrl}/login?error=jwt_failed`);
    }
  })(req, res, next);
};

module.exports = {
  googleLogin,
  googleCallback
};
