/**
 * Middleware de autenticación con JWT y protección CSRF
 */

const jwt = require('jsonwebtoken');

/**
 * Middleware para verificar el token JWT y el token CSRF
 */
const authenticateToken = (req, res, next) => {
  try {
    // Obtener el token JWT de las cookies
    const token = req.cookies.jwt_token;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Acceso denegado. No se proporcionó token de autenticación.'
      });
    }

    // Verificar el token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar el token CSRF en el header
    const csrfToken = req.headers['x-csrf-token'];
    
    if (!csrfToken || csrfToken !== decoded.csrfToken) {
      return res.status(403).json({
        success: false,
        message: 'Token CSRF inválido o no proporcionado.'
      });
    }

    // Agregar la información del usuario al request
    req.user = {
      email: decoded.email,
      apiKey: decoded.apiKey
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token JWT inválido.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token JWT expirado.'
      });
    }

    console.error('Error en autenticación:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor en autenticación.'
    });
  }
};

/**
 * Middleware para verificar la API Key en el login inicial
 */
const verifyApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({
      success: false,
      message: 'API Key inválida o no proporcionada.'
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  verifyApiKey
};
