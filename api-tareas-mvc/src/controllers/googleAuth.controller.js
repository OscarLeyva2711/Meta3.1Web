const passport = require('passport');
const jwt = require('jsonwebtoken');

/**
 * Iniciar autenticación con Google
 */
const googleLogin = (req, res, next) => {
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    accessType: 'offline',
    prompt: 'consent'
  })(req, res, next);
};

/**
 * Callback de Google OAuth
 */
const googleCallback = (req, res, next) => {
  console.log('=== GOOGLE OAUTH CALLBACK RECIBIDO ===');
  console.log('URL completa:', req.originalUrl);
  console.log('Query params:', req.query);
  console.log('Headers:', req.headers);
  
  passport.authenticate('google', (err, user, info) => {
    if (err) {
      console.error('Error en Google OAuth callback:', err);
      return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_error`);
    }
    
    if (!user) {
      console.error('Usuario no encontrado en Google OAuth callback');
      console.error('Info de Passport:', info);
      return res.redirect(`${process.env.CLIENT_URL}/login?error=no_user`);
    }
    
    // Login exitoso - generar JWT
    try {
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          rol: user.role || 'user',
          googleId: user.googleId
        },
        process.env.JWT_SECRET || 'tu_secreto_aqui',
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      const clientUrl = process.env.CLIENT_URL || 'https://localhost:5173';
      const callbackURL = `${clientUrl}/oauth-callback?token=${encodeURIComponent(token)}&email=${encodeURIComponent(user.email)}`;
      
      console.log('✅ Usuario autenticado exitosamente:', user.email);
      console.log('✅ Token generado:', token.substring(0, 30) + '...');
      console.log('✅ Redirigiendo a:', callbackURL);
      
      return res.redirect(callbackURL);
    } catch (error) {
      console.error('Error generando JWT:', error);
      return res.redirect(`${process.env.CLIENT_URL}/login?error=jwt_failed`);
    }
  })(req, res, next);
};

module.exports = {
  googleLogin,
  googleCallback
};
