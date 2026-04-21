/**
 * Controlador de Tags
 * Maneja las operaciones CRUD de tags y sus relaciones
 */

const db = require('../models');
const { Op } = require('sequelize');

// ============================================================================
// CRUD DE TAGS
// ============================================================================

/**
 * GET /api/tags - Obtener todos los tags
 */
const obtenerTodos = async (req, res) => {
  try {
    const tags = await db.Tag.findAll({
      include: [
        {
          model: db.Tarea,
          as: 'tareas',
          attributes: ['id', 'titulo', 'estado'],
          through: { attributes: [] }
        }
      ],
      attributes: ['id', 'nombre', 'createdAt', 'updatedAt']
    });

    res.json({
      success: true,
      data: tags,
      total: tags.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener tags',
      error: error.message
    });
  }
};

/**
 * GET /api/tags/:id - Obtener un tag por ID
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

    const tag = await db.Tag.findByPk(id, {
      include: [
        {
          model: db.Tarea,
          as: 'tareas',
          attributes: ['id', 'titulo', 'descripcion', 'estado', 'createdAt'],
          through: { attributes: [] },
          include: [
            {
              model: db.Persona,
              as: 'persona',
              attributes: ['id', 'nombre', 'email']
            }
          ]
        }
      ]
    });

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: `Tag con ID ${id} no encontrado`
      });
    }

    res.json({
      success: true,
      data: tag
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener tag',
      error: error.message
    });
  }
};

/**
 * POST /api/tags - Crear un nuevo tag
 */
const crear = async (req, res) => {
  try {
    const { nombre } = req.body;

    // Validaciones
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'El campo "nombre" es requerido'
      });
    }

    // Verificar si el tag ya existe
    const tagExistente = await db.Tag.findOne({
      where: { nombre: nombre.trim().toLowerCase() }
    });
    if (tagExistente) {
      return res.status(409).json({
        success: false,
        message: 'El tag ya existe'
      });
    }

    const nuevoTag = await db.Tag.create({
      nombre: nombre.trim().toLowerCase()
    });

    res.status(201).json({
      success: true,
      message: 'Tag creado exitosamente',
      data: nuevoTag
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear tag',
      error: error.message
    });
  }
};

/**
 * PUT /api/tags/:id - Actualizar un tag
 */
const actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido. Debe ser un número'
      });
    }

    // Validaciones
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'El campo "nombre" es requerido'
      });
    }

    const tag = await db.Tag.findByPk(id);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: `Tag con ID ${id} no encontrado`
      });
    }

    // Verificar si el nuevo nombre ya existe (pero no si es el mismo)
    const nombreNormalizado = nombre.trim().toLowerCase();
    if (nombreNormalizado !== tag.nombre) {
      const tagExistente = await db.Tag.findOne({
        where: { nombre: nombreNormalizado }
      });
      if (tagExistente) {
        return res.status(409).json({
          success: false,
          message: 'El tag con este nombre ya existe'
        });
      }
    }

    await tag.update({ nombre: nombreNormalizado });

    res.json({
      success: true,
      message: 'Tag actualizado exitosamente',
      data: tag
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar tag',
      error: error.message
    });
  }
};

/**
 * DELETE /api/tags/:id - Eliminar un tag
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

    const tag = await db.Tag.findByPk(id);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: `Tag con ID ${id} no encontrado`
      });
    }

    // Eliminar relaciones primero
    await tag.setTareas([]);

    // Luego eliminar el tag
    await tag.destroy();

    res.json({
      success: true,
      message: 'Tag eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar tag',
      error: error.message
    });
  }
};

// ============================================================================
// BÚSQUEDAS Y FILTROS
// ============================================================================

/**
 * GET /api/tags/buscar?nombre= - Buscar tags por nombre
 */
const buscar = async (req, res) => {
  try {
    const { nombre } = req.query;

    if (!nombre) {
      return res.status(400).json({
        success: false,
        message: 'Proporciona un parámetro de búsqueda: nombre'
      });
    }

    const tags = await db.Tag.findAll({
      where: {
        nombre: { [Op.like]: `%${nombre.toLowerCase()}%` }
      },
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
      data: tags,
      total: tags.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al buscar tags',
      error: error.message
    });
  }
};

// ============================================================================
// RELACIONES - TAGS ↔ TAREAS Y PERSONAS
// ============================================================================

/**
 * GET /api/tags/:id/tareas - Obtener todas las tareas asociadas a un tag
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

    const tag = await db.Tag.findByPk(id);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: `Tag con ID ${id} no encontrado`
      });
    }

    const tareas = await db.Tarea.findAll({
      include: [
        {
          model: db.Tag,
          as: 'tags',
          where: { id: id },
          attributes: [],
          through: { attributes: [] }
        },
        {
          model: db.Persona,
          as: 'persona',
          attributes: ['id', 'nombre', 'email']
        }
      ],
      attributes: ['id', 'titulo', 'descripcion', 'estado', 'createdAt', 'updatedAt']
    });

    res.json({
      success: true,
      data: {
        tag: {
          id: tag.id,
          nombre: tag.nombre
        },
        tareas,
        total: tareas.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener tareas del tag',
      error: error.message
    });
  }
};

/**
 * GET /api/tags/:id/personas - Obtener todas las personas asociadas a un tag (indirecto)
 * Relación indirecta: Tag -> Tareas -> Personas
 */
const obtenerPersonas = async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido. Debe ser un número'
      });
    }

    const tag = await db.Tag.findByPk(id);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: `Tag con ID ${id} no encontrado`
      });
    }

    // Obtener todas las tareas con este tag
    const tareas = await db.Tarea.findAll({
      include: [
        {
          model: db.Tag,
          as: 'tags',
          where: { id: id },
          attributes: [],
          through: { attributes: [] }
        },
        {
          model: db.Persona,
          as: 'persona',
          attributes: ['id', 'nombre', 'email']
        }
      ],
      attributes: ['id']
    });

    // Extraer personas únicas
    const personasMap = new Map();

    tareas.forEach(tarea => {
      if (tarea.persona && !personasMap.has(tarea.persona.id)) {
        personasMap.set(tarea.persona.id, tarea.persona);
      }
    });

    const personas = Array.from(personasMap.values());

    res.json({
      success: true,
      data: {
        tag: {
          id: tag.id,
          nombre: tag.nombre
        },
        personas,
        total: personas.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener personas del tag',
      error: error.message
    });
  }
};

module.exports = {
  // CRUD
  obtenerTodos,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
  // Búsquedas
  buscar,
  // Relaciones
  obtenerTareas,
  obtenerPersonas
};
