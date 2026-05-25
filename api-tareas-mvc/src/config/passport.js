/**
 * Configuración de Passport.js con Google OAuth.
 * Usa el modelo `Usuario` (consistente con el resto del backend).
 */

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import db from '../models/index.js';

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'https://localhost:3000/api/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      const foto = profile.photos?.[0]?.value || null;

      // 1. ¿Existe ya un usuario con ese googleId?
      let usuario = await db.Usuario.findOne({ where: { googleId: profile.id } });

      // 2. Si no, intentar vincular por email (cuenta tradicional preexistente)
      if (!usuario && email) {
        usuario = await db.Usuario.findOne({ where: { email } });
        if (usuario) {
          await usuario.update({
            googleId: profile.id,
            foto: usuario.foto || foto
          });
        }
      }

      // 3. Si sigue sin existir, crear uno nuevo
      if (!usuario) {
        usuario = await db.Usuario.create({
          nombre: profile.displayName || (email ? email.split('@')[0] : 'Usuario Google'),
          email,
          googleId: profile.id,
          foto,
          activo: true,
          rol: 'usuario'
        });
      }

      return done(null, usuario);
    } catch (error) {
      console.error('Error en estrategia de Google:', error);
      return done(error, null);
    }
  }
));

passport.serializeUser((usuario, done) => {
  done(null, usuario.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const usuario = await db.Usuario.findByPk(id);
    done(null, usuario);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
