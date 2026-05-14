/**
 * Middleware de autenticación con JWT y protección CSRF condicional.
 *
 * - Acepta el JWT desde cookie httpOnly (`jwt_token`) o desde el header
 *   `Authorization: Bearer <token>`.
 * - El CSRF (header `x-csrf-token`) sólo se exige cuando el token llega por
 *   cookie (flujo tradicional vulnerable a CSRF). Para Bearer (flujo OAuth)
 *   no aplica, porque el envío del header es explícito desde JS y no
 *   automático del navegador.
 */

const jwt = require('jsonwebtoken');

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

const authenticateToken = (req, res, next) => {
  try {
    const { token, source } = extractToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Acceso denegado. No se proporcionó token de autenticación.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // CSRF sólo cuando el token vino por cookie
    if (source === 'cookie') {
      const csrfToken = req.headers['x-csrf-token'];
      if (!csrfToken || csrfToken !== decoded.csrfToken) {
        return res.status(403).json({
          success: false,
          message: 'Token CSRF inválido o no proporcionado.'
        });
      }
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      rol: decoded.rol
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

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.rol)) {
    return res.status(403).json({
      success: false,
      message: 'No tienes permisos para realizar esta acción.'
    });
  }
  next();
};

const requireAdmin = requireRole('admin');

module.exports = {
  authenticateToken,
  verifyApiKey,
  requireRole,
  requireAdmin
};
