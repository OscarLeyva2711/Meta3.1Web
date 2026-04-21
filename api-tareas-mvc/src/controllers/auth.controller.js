/**
 * Controlador de autenticación
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Iniciar sesión - Genera JWT y token CSRF
 */
const login = (req, res) => {
  try {
    const { email } = req.body;

    // Validar que se proporcionó un email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'El email es requerido.'
      });
    }

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'El formato del email no es válido.'
      });
    }

    // Generar token CSRF único
    const csrfToken = crypto.randomBytes(32).toString('hex');

    // Crear payload del JWT
    const payload = {
      email: email,
      apiKey: process.env.API_KEY,
      csrfToken: csrfToken
    };

    // Generar JWT
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });

    // Configurar opciones de cookies
    const cookieOptions = {
      httpOnly: true, // Solo accesible por el servidor
      secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', // Lax para desarrollo
      maxAge: parseInt(process.env.COOKIE_MAX_AGE) || 3600000 // 1 hora por defecto
    };

    // Establecer cookies
    res.cookie('jwt_token', token, cookieOptions);
    res.cookie('csrf_token', csrfToken, {
      ...cookieOptions,
      httpOnly: false // El cliente necesita acceso para leerlo
    });

    // Responder con éxito
    res.status(200).json({
      success: true,
      message: 'Autenticación exitosa.',
      data: {
        user: {
          email: email
        },
        csrfToken: csrfToken, // Enviar también en la respuesta para facilitar el uso
        expiresIn: process.env.JWT_EXPIRES_IN
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al procesar el login.'
    });
  }
};

/**
 * Cerrar sesión - Elimina las cookies
 */
const logout = (req, res) => {
  try {
    // Eliminar cookies
    res.clearCookie('jwt_token');
    res.clearCookie('csrf_token');

    res.status(200).json({
      success: true,
      message: 'Sesión cerrada exitosamente.'
    });

  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al cerrar sesión.'
    });
  }
};

/**
 * Verificar estado de autenticación
 */
const verify = (req, res) => {
  try {
    // El middleware authenticateToken ya verificó el token
    // Si llegamos aquí, el usuario está autenticado
    
    res.status(200).json({
      success: true,
      message: 'Usuario autenticado correctamente.',
      data: {
        user: req.user
      }
    });

  } catch (error) {
    console.error('Error en verify:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al verificar autenticación.'
    });
  }
};

module.exports = {
  login,
  logout,
  verify
};
