/**
 * Controlador de Usuarios
 * Maneja la autenticación, registro y gestión de usuarios
 */

const db = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

// ============================================================================
// REGISTRO Y AUTENTICACIÓN
// ============================================================================

/**
 * POST /api/usuarios/registro - Registrar un nuevo usuario
 */
const registro = async (req, res) => {
  try {
    const { nombre, email, password, passwordConfirm } = req.body;

    // Validaciones
    if (!nombre || !email || !password || !passwordConfirm) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos'
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'El formato del email no es válido'
      });
    }

    // Validar que las contraseñas coincidan
    if (password !== passwordConfirm) {
      return res.status(400).json({
        success: false,
        message: 'Las contraseñas no coinciden'
      });
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Verificar si el email ya existe
    const usuarioExistente = await db.Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(409).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Crear nuevo usuario
    const nuevoUsuario = await db.Usuario.create({
      nombre,
      email,
      password,
      activo: true,
      rol: 'usuario'
    });

    // Generar JWT
    const token = jwt.sign(
      { id: nuevoUsuario.id, email: nuevoUsuario.email, rol: nuevoUsuario.rol },
      process.env.JWT_SECRET || 'tu_secreto_aqui',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol
      },
      token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message
    });
  }
};

/**
 * POST /api/usuarios/login - Login de usuario
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    // Buscar usuario
    const usuario = await db.Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Email o contraseña incorrectos'
      });
    }

    // Verificar que el usuario está activo
    if (!usuario.activo) {
      return res.status(403).json({
        success: false,
        message: 'Usuario desactivado. Contacta al administrador'
      });
    }

    // Verificar contraseña
    const passwordValida = await usuario.verificarPassword(password);
    if (!passwordValida) {
      return res.status(401).json({
        success: false,
        message: 'Email o contraseña incorrectos'
      });
    }

    // Generar JWT
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET || 'tu_secreto_aqui',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      },
      token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message
    });
  }
};

// ============================================================================
// CRUD DE USUARIOS
// ============================================================================

/**
 * GET /api/usuarios - Obtener todos los usuarios (solo admin)
 */
const obtenerTodos = async (req, res) => {
  try {
    const usuarios = await db.Usuario.findAll({
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: usuarios,
      total: usuarios.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: error.message
    });
  }
};

/**
 * GET /api/usuarios/:id - Obtener un usuario por ID
 */
const obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido. Debe ser un número'
      });
    }

    const usuario = await db.Usuario.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: `Usuario con ID ${id} no encontrado`
      });
    }

    res.json({
      success: true,
      data: usuario
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuario',
      error: error.message
    });
  }
};

/**
 * PUT /api/usuarios/:id - Actualizar usuario
 */
const actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, rol } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido. Debe ser un número'
      });
    }

    const usuario = await db.Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: `Usuario con ID ${id} no encontrado`
      });
    }

    // Validaciones
    if (!nombre || !email) {
      return res.status(400).json({
        success: false,
        message: 'Nombre y email son requeridos'
      });
    }

    // Validar email si cambió
    if (email !== usuario.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'El formato del email no es válido'
        });
      }

      const emailExistente = await db.Usuario.findOne({ where: { email } });
      if (emailExistente) {
        return res.status(409).json({
          success: false,
          message: 'El email ya está registrado'
        });
      }
    }

    // Actualizar solo campos permitidos
    await usuario.update({
      nombre,
      email,
      rol: rol || usuario.rol
    });

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        activo: usuario.activo
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar usuario',
      error: error.message
    });
  }
};

/**
 * PUT /api/usuarios/:id/password - Cambiar contraseña
 */
const cambiarPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { passwordActual, passwordNueva, passwordConfirm } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido. Debe ser un número'
      });
    }

    // Validaciones
    if (!passwordActual || !passwordNueva || !passwordConfirm) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos de contraseña son requeridos'
      });
    }

    if (passwordNueva !== passwordConfirm) {
      return res.status(400).json({
        success: false,
        message: 'Las contraseñas nuevas no coinciden'
      });
    }

    if (passwordNueva.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    const usuario = await db.Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: `Usuario con ID ${id} no encontrado`
      });
    }

    // Verificar contraseña actual
    const passwordValida = await usuario.verificarPassword(passwordActual);
    if (!passwordValida) {
      return res.status(401).json({
        success: false,
        message: 'La contraseña actual es incorrecta'
      });
    }

    // Actualizar contraseña
    await usuario.update({ password: passwordNueva });

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al cambiar contraseña',
      error: error.message
    });
  }
};

/**
 * DELETE /api/usuarios/:id - Eliminar usuario
 */
const eliminar = async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido. Debe ser un número'
      });
    }

    const usuario = await db.Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: `Usuario con ID ${id} no encontrado`
      });
    }

    await usuario.destroy();

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar usuario',
      error: error.message
    });
  }
};

// ============================================================================
// ACTIVACIÓN Y DESACTIVACIÓN
// ============================================================================

/**
 * PATCH /api/usuarios/:id/activar - Activar usuario
 */
const activar = async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido. Debe ser un número'
      });
    }

    const usuario = await db.Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: `Usuario con ID ${id} no encontrado`
      });
    }

    if (usuario.activo) {
      return res.status(400).json({
        success: false,
        message: 'El usuario ya está activo'
      });
    }

    await usuario.update({ activo: true });

    res.json({
      success: true,
      message: 'Usuario activado exitosamente',
      data: {
        id: usuario.id,
        activo: usuario.activo
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al activar usuario',
      error: error.message
    });
  }
};

/**
 * PATCH /api/usuarios/:id/desactivar - Desactivar usuario
 */
const desactivar = async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido. Debe ser un número'
      });
    }

    const usuario = await db.Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: `Usuario con ID ${id} no encontrado`
      });
    }

    if (!usuario.activo) {
      return res.status(400).json({
        success: false,
        message: 'El usuario ya está desactivado'
      });
    }

    await usuario.update({ activo: false });

    res.json({
      success: true,
      message: 'Usuario desactivado exitosamente',
      data: {
        id: usuario.id,
        activo: usuario.activo
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al desactivar usuario',
      error: error.message
    });
  }
};

// ============================================================================
// BÚSQUEDAS Y FILTROS
// ============================================================================

/**
 * GET /api/usuarios/buscar?nombre= - Buscar usuarios
 */
const buscar = async (req, res) => {
  try {
    const { nombre, email, rol, activo } = req.query;

    const where = {};
    if (nombre) where.nombre = { [Op.like]: `%${nombre}%` };
    if (email) where.email = { [Op.like]: `%${email}%` };
    if (rol) where.rol = rol;
    if (activo !== undefined) where.activo = activo === 'true';

    const usuarios = await db.Usuario.findAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: usuarios,
      total: usuarios.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al buscar usuarios',
      error: error.message
    });
  }
};

module.exports = {
  // Autenticación
  registro,
  login,
  // CRUD
  obtenerTodos,
  obtenerPorId,
  actualizar,
  cambiarPassword,
  eliminar,
  // Activación
  activar,
  desactivar,
  // Búsquedas
  buscar
};
