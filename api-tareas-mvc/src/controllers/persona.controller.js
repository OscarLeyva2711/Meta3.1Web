/**
 * Controlador de Personas
 * Maneja las operaciones CRUD de personas y sus relaciones
 */

const db = require('../models');
const { Op } = require('sequelize');

// ============================================================================
// CRUD DE PERSONAS
// ============================================================================

/**
 * GET /api/personas - Obtener todas las personas
 */
const obtenerTodas = async (req, res) => {
  try {
    const personas = await db.Persona.findAll({
      include: [
        {
          model: db.Tarea,
          as: 'tareas',
          attributes: ['id', 'titulo', 'estado'],
          through: { attributes: [] }
        }
      ],
      attributes: ['id', 'nombre', 'email', 'createdAt', 'updatedAt']
    });

    res.json({
      success: true,
      data: personas,
      total: personas.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener personas',
      error: error.message
    });
  }
};

/**
 * GET /api/personas/:id - Obtener una persona por ID
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

    const persona = await db.Persona.findByPk(id, {
      include: [
        {
          model: db.Tarea,
          as: 'tareas',
          attributes: ['id', 'titulo', 'descripcion', 'estado', 'createdAt'],
          include: [
            {
              model: db.Tag,
              as: 'tags',
              attributes: ['id', 'nombre'],
              through: { attributes: [] }
            }
          ]
        }
      ]
    });

    if (!persona) {
      return res.status(404).json({
        success: false,
        message: `Persona con ID ${id} no encontrada`
      });
    }

    res.json({
      success: true,
      data: persona
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener persona',
      error: error.message
    });
  }
};

/**
 * POST /api/personas - Crear una nueva persona
 */
const crear = async (req, res) => {
  try {
    const { nombre, email } = req.body;

    // Validaciones
    if (!nombre || !email) {
      return res.status(400).json({
        success: false,
        message: 'Los campos "nombre" y "email" son requeridos'
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

    // Verificar si el email ya existe
    const emailExistente = await db.Persona.findOne({ where: { email } });
    if (emailExistente) {
      return res.status(409).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    const nuevaPersona = await db.Persona.create({
      nombre,
      email
    });

    res.status(201).json({
      success: true,
      message: 'Persona creada exitosamente',
      data: nuevaPersona
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear persona',
      error: error.message
    });
  }
};

/**
 * PUT /api/personas/:id - Actualizar persona completamente
 */
const actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido. Debe ser un número'
      });
    }

    // Validaciones
    if (!nombre || !email) {
      return res.status(400).json({
        success: false,
        message: 'Los campos "nombre" y "email" son requeridos'
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

    const persona = await db.Persona.findByPk(id);
    if (!persona) {
      return res.status(404).json({
        success: false,
        message: `Persona con ID ${id} no encontrada`
      });
    }

    // Verificar si el nuevo email ya existe (pero no si es el mismo)
    if (email !== persona.email) {
      const emailExistente = await db.Persona.findOne({ where: { email } });
      if (emailExistente) {
        return res.status(409).json({
          success: false,
          message: 'El email ya está registrado'
        });
      }
    }

    await persona.update({ nombre, email });

    res.json({
      success: true,
      message: 'Persona actualizada exitosamente',
      data: persona
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar persona',
      error: error.message
    });
  }
};

/**
 * DELETE /api/personas/:id - Eliminar una persona
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

    const persona = await db.Persona.findByPk(id);
    if (!persona) {
      return res.status(404).json({
        success: false,
        message: `Persona con ID ${id} no encontrada`
      });
    }

    // Verificar si tiene tareas
    const tareaCount = await db.Tarea.count({ where: { persona_id: id } });
    if (tareaCount > 0) {
      return res.status(409).json({
        success: false,
        message: `No se puede eliminar. La persona tiene ${tareaCount} tarea(s) asignada(s)`
      });
    }

    await persona.destroy();

    res.json({
      success: true,
      message: 'Persona eliminada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar persona',
      error: error.message
    });
  }
};

// ============================================================================
// BÚSQUEDAS Y FILTROS
// ============================================================================

/**
 * GET /api/personas/buscar?nombre= - Buscar personas por nombre
 */
const buscar = async (req, res) => {
  try {
    const { nombre, email } = req.query;

    if (!nombre && !email) {
      return res.status(400).json({
        success: false,
        message: 'Proporciona al menos un parámetro de búsqueda: nombre o email'
      });
    }

    const where = {};
    if (nombre) where.nombre = { [Op.like]: `%${nombre}%` };
    if (email) where.email = { [Op.like]: `%${email}%` };

    const personas = await db.Persona.findAll({
      where,
      include: [
        {
          model: db.Tarea,
          as: 'tareas',
          attributes: ['id', 'titulo', 'estado'],
          through: { attributes: [] }
        }
      ]
    });

    res.json({
      success: true,
      data: personas,
      total: personas.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al buscar personas',
      error: error.message
    });
  }
};

// ============================================================================
// RELACIONES - PERSONAS ↔ TAREAS
// ============================================================================

/**
 * GET /api/personas/:id/tareas - Obtener todas las tareas de una persona
 */
const obtenerTareas = async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido. Debe ser un número'
      });
    }

    const persona = await db.Persona.findByPk(id);
    if (!persona) {
      return res.status(404).json({
        success: false,
        message: `Persona con ID ${id} no encontrada`
      });
    }

    const tareas = await db.Tarea.findAll({
      where: { persona_id: id },
      include: [
        {
          model: db.Tag,
          as: 'tags',
          attributes: ['id', 'nombre'],
          through: { attributes: [] }
        }
      ],
      attributes: ['id', 'titulo', 'descripcion', 'estado', 'createdAt', 'updatedAt']
    });

    res.json({
      success: true,
      data: {
        persona: {
          id: persona.id,
          nombre: persona.nombre,
          email: persona.email
        },
        tareas,
        total: tareas.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener tareas de persona',
      error: error.message
    });
  }
};

/**
 * GET /api/personas/:id/tags - Obtener todos los tags relacionados con una persona (indirecto)
 * Relación indirecta: Persona -> Tareas -> Tags
 */
const obtenerTags = async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido. Debe ser un número'
      });
    }

    const persona = await db.Persona.findByPk(id);
    if (!persona) {
      return res.status(404).json({
        success: false,
        message: `Persona con ID ${id} no encontrada`
      });
    }

    // Obtener todas las tareas de la persona
    const tareas = await db.Tarea.findAll({
      where: { persona_id: id },
      include: [
        {
          model: db.Tag,
          as: 'tags',
          attributes: ['id', 'nombre'],
          through: { attributes: [] }
        }
      ],
      attributes: ['id']
    });

    // Extraer tags únicos
    const tagsSet = new Set();
    const tagsMap = new Map();

    tareas.forEach(tarea => {
      if (tarea.tags && tarea.tags.length > 0) {
        tarea.tags.forEach(tag => {
          if (!tagsMap.has(tag.id)) {
            tagsMap.set(tag.id, tag);
          }
        });
      }
    });

    const tags = Array.from(tagsMap.values());

    res.json({
      success: true,
      data: {
        persona: {
          id: persona.id,
          nombre: persona.nombre,
          email: persona.email
        },
        tags,
        total: tags.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener tags de persona',
      error: error.message
    });
  }
};

module.exports = {
  // CRUD
  obtenerTodas,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
  // Búsquedas
  buscar,
  // Relaciones
  obtenerTareas,
  obtenerTags
};
