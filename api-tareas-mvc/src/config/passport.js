/**
 * Configuración de Passport.js con Google OAuth
 */

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('../models');

/**
 * Estrategia de Google OAuth
 */
passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackURL: `https://localhost:3000/api/auth/google/callback`
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Buscar usuario por googleId
      let usuario = await db.User.findOne({
        where: { googleId: profile.id }
      });

      // Si no existe, crear nuevo usuario
      if (!usuario) {
        usuario = await db.User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          picture: profile.photos[0]?.value || null,
          isActive: true,
          role: 'user',
          lastLogin: new Date()
        });
      } else {
        // Actualizar último login
        await usuario.update({
          lastLogin: new Date()
        });
      }

      return done(null, usuario);
    } catch (error) {
      console.error('Error en estrategia de Google:', error);
      return done(error, null);
    }
  }
));

/**
 * Serializar usuario para la sesión
 */
passport.serializeUser((usuario, done) => {
  done(null, usuario.id);
});

/**
 * Deserializar usuario desde la sesión
 */
passport.deserializeUser(async (id, done) => {
  try {
    const usuario = await db.User.findByPk(id);
    done(null, usuario);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
