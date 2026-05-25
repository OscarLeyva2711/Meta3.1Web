/**
 * Controlador de autenticación
 * Soporta login tradicional con JWT (cookie + CSRF) y verify multimodal (cookie o Bearer).
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import db from '../models/index.js';

/**
 * Extrae el JWT desde la cookie httpOnly o desde el header Authorization Bearer.
 * Devuelve { token, source } donde source ∈ {'cookie', 'bearer', null}.
 */
function extractToken(req) {
  if (req.cookies?.jwt_token) {
    return { token: req.cookies.jwt_token, source: 'cookie' };
  }
  const auth = req.headers.authorization || '';
  if (auth.startsWith('Bearer ')) {
    return { token: auth.slice(7), source: 'bearer' };
  }
  return { token: null, source: null };
}

/**
 * POST /api/auth/register
 * Registrar un nuevo usuario con email y contraseña
 */
const register = async (req, res) => {
  try {
    const { nombre, email, password, rol = 'usuario' } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, email y contraseña son requeridos.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'El formato del email no es válido.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres.'
      });
    }

    // Verificar si el email ya existe
    const usuarioExistente = await db.Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(409).json({
        success: false,
        message: 'El email ya está registrado.'
      });
    }

    // Crear nuevo usuario
    const nuevoUsuario = await db.Usuario.create({
      nombre,
      email,
      password,
      rol,
      activo: true
    });

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente. Por favor, inicia sesión.',
      data: {
        id: nuevoUsuario.id,
        email: nuevoUsuario.email,
        nombre: nuevoUsuario.nombre,
        rol: nuevoUsuario.rol
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al registrar usuario.'
    });
  }
};

/**
 * POST /api/auth/login
 * Iniciar sesión con email/password validados contra la base de datos.
 * Genera JWT (firmado con datos reales del usuario) y token CSRF.
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'El formato del email no es válido.'
      });
    }

    // Validación REAL contra la base de datos
    const usuario = await db.Usuario.findOne({ where: { email } });
    if (!usuario || !usuario.password) {
      return res.status(401).json({
        success: false,
        message: 'Email o contraseña incorrectos.'
      });
    }

    if (!usuario.activo) {
      return res.status(403).json({
        success: false,
        message: 'Usuario desactivado. Contacta al administrador.'
      });
    }

    const passwordValida = await usuario.verificarPassword(password);
    if (!passwordValida) {
      return res.status(401).json({
        success: false,
        message: 'Email o contraseña incorrectos.'
      });
    }

    // Generar token CSRF único
    const csrfToken = crypto.randomBytes(32).toString('hex');

    // Payload con datos REALES del usuario
    const payload = {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      csrfToken: csrfToken
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });

    // Cookies. Como dev usa HTTPS con certs autofirmados, secure: true funciona.
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: parseInt(process.env.COOKIE_MAX_AGE) || 3600000
    };

    res.cookie('jwt_token', token, cookieOptions);
    res.cookie('csrf_token', csrfToken, {
      ...cookieOptions,
      httpOnly: false // El cliente debe poder leer el csrf_token
    });

    return res.status(200).json({
      success: true,
      message: 'Autenticación exitosa.',
      token,
      data: {
        user: {
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre,
          rol: usuario.rol
        },
        csrfToken,
        expiresIn: process.env.JWT_EXPIRES_IN
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al procesar el login.'
    });
  }
};

/**
 * POST /api/auth/logout
 * Elimina cookies de sesión.
 */
const logout = (req, res) => {
  try {
    res.clearCookie('jwt_token');
    res.clearCookie('csrf_token');
    return res.status(200).json({
      success: true,
      message: 'Sesión cerrada exitosamente.'
    });
  } catch (error) {
    console.error('Error en logout:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al cerrar sesión.'
    });
  }
};

/**
 * GET /api/auth/verify
 * Verifica el estado de autenticación. Acepta JWT desde cookie o desde Bearer
 * (necesario para el flujo OAuth, donde el token viaja en Authorization header).
 */
const verify = async (req, res) => {
  try {
    // 1. Sesión Passport (Google OAuth con sesión activa)
    if (req.user && req.user.id) {
      return res.status(200).json({
        success: true,
        message: 'Usuario autenticado (sesión Passport).',
        data: { user: req.user }
      });
    }

    // 2. JWT en cookie o Bearer
    const { token } = extractToken(req);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({
      success: true,
      message: 'Usuario autenticado (JWT).',
      data: {
        user: {
          id: decoded.id,
          email: decoded.email,
          rol: decoded.rol
        }
      }
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado.'
    });
  }
};

export default {
  register,
  login,
  logout,
  verify
};
