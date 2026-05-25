/**
 * Controlador de Tareas
 * Maneja las operaciones CRUD de tareas y sus relaciones con Personas y Tags
 */

import db from '../models/index.js';
import { Op } from 'sequelize';

function getUsuarioId(req) {
  return req.user?.id;
}

function parseIds(value) {
  if (!value) return [];
  const raw = Array.isArray(value) ? value : String(value).split(',');
  return raw.map(v => parseInt(v, 10)).filter(Number.isInteger);
}

function canUseAdminScope(req) {
  return req.user?.rol === 'admin' && req.query.scope === 'all';
}

function tareaIncludes(tagIds = []) {
  const tagInclude = {
    model: db.Tag,
    as: 'tags',
    attributes: ['id', 'nombre'],
    through: { attributes: [] }
  };

  if (tagIds.length) {
    tagInclude.where = { id: { [Op.in]: tagIds } };
    tagInclude.required = true;
  }

  return [
    {
      model: db.Persona,
      as: 'persona',
      attributes: ['id', 'nombre', 'email']
    },
    {
      model: db.Usuario,
      as: 'usuario',
      attributes: ['id', 'nombre', 'email']
    },
    tagInclude
  ];
}

async function findUserTask(id, usuarioId, options = {}) {
  return db.Tarea.findOne({
    where: { id, usuario_id: usuarioId },
    ...options
  });
}

// ============================================================================
// CRUD DE TAREAS
// ============================================================================

/**
 * GET /api/tareas - Obtener todas las tareas
 */
const obtenerTodas = async (req, res) => {
  try {
    const { estado } = req.query;
    const usuarioId = getUsuarioId(req);
    const tagIds = parseIds(req.query.tagIds);

    const where = canUseAdminScope(req) ? {} : { usuario_id: usuarioId };
    if (estado) where.estado = estado;

    const tareas = await db.Tarea.findAll({
      where,
      include: tareaIncludes(tagIds),
      distinct: true,
      attributes: ['id', 'titulo', 'descripcion', 'estado', 'persona_id', 'usuario_id', 'createdAt', 'updatedAt']
    });

    res.json({
      success: true,
      data: tareas,
      total: tareas.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener tareas',
      error: error.message
    });
  }
};

/**
 * GET /api/tareas/:id - Obtener una tarea por ID
 */
const obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = getUsuarioId(req);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido. Debe ser un número'
      });
    }

    const tarea = await findUserTask(id, usuarioId, { include: tareaIncludes() });

    if (!tarea) {
      return res.status(404).json({
        success: false,
        message: `Tarea con ID ${id} no encontrada`
      });
    }

    res.json({
      success: true,
      data: tarea
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener tarea',
      error: error.message
    });
  }
};

/**
 * POST /api/tareas - Crear una nueva tarea
 */
const crear = async (req, res) => {
  try {
    const { titulo, descripcion, estado, persona_id, tagIds } = req.body;
    const usuarioId = getUsuarioId(req);

    // Validaciones
    if (!titulo) {
      return res.status(400).json({
        success: false,
        message: 'El campo "titulo" es requerido'
      });
    }

    if (persona_id) {
      const persona = await db.Persona.findByPk(persona_id);
      if (!persona) {
        return res.status(404).json({
          success: false,
          message: `Persona con ID ${persona_id} no encontrada`
        });
      }
    }

    const nuevaTarea = await db.Tarea.create({
      titulo,
      descripcion: descripcion || null,
      estado: estado || 'pendiente',
      persona_id: persona_id || null,
      usuario_id: usuarioId
    });

    // Agregar tags si se proporcionan
    if (tagIds && Array.isArray(tagIds) && tagIds.length > 0) {
      await nuevaTarea.addTags(tagIds);
    }

    // Recargar con relaciones
    const tareaCompleta = await findUserTask(nuevaTarea.id, usuarioId, { include: tareaIncludes() });

    res.status(201).json({
      success: true,
      message: 'Tarea creada exitosamente',
      data: tareaCompleta
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear tarea',
      error: error.message
    });
  }
};

/**
 * PUT /api/tareas/:id - Actualizar tarea completamente
 */
const actualizarCompleta = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, estado, persona_id, tagIds } = req.body;
    const usuarioId = getUsuarioId(req);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido. Debe ser un número'
      });
    }

    // Validaciones
    if (!titulo) {
      return res.status(400).json({
        success: false,
        message: 'El campo "titulo" es requerido'
      });
    }

    const tarea = await findUserTask(id, usuarioId);
    if (!tarea) {
      return res.status(404).json({
        success: false,
        message: `Tarea con ID ${id} no encontrada`
      });
    }

    if (persona_id) {
      const persona = await db.Persona.findByPk(persona_id);
      if (!persona) {
        return res.status(404).json({
          success: false,
          message: `Persona con ID ${persona_id} no encontrada`
        });
      }
    }

    await tarea.update({
      titulo,
      descripcion: descripcion || null,
      estado: estado || 'pendiente',
      persona_id: persona_id || tarea.persona_id
    });

    // Actualizar tags si se proporcionan
    if (Array.isArray(tagIds)) {
      await tarea.setTags(tagIds);
    }

    // Recargar con relaciones
    const tareaActualizada = await findUserTask(id, usuarioId, { include: tareaIncludes() });

    res.json({
      success: true,
      message: 'Tarea actualizada exitosamente',
      data: tareaActualizada
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar tarea',
      error: error.message
    });
  }
};

/**
 * PATCH /api/tareas/:id - Actualizar tarea parcialmente
 */
const actualizarParcial = async (req, res) => {
  try {
    const { id } = req.params;
    const actualizaciones = req.body;
    const usuarioId = getUsuarioId(req);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido. Debe ser un número'
      });
    }

    if (Object.keys(actualizaciones).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Debe enviar al menos un campo para actualizar'
      });
    }

    const tarea = await findUserTask(id, usuarioId);
    if (!tarea) {
      return res.status(404).json({
        success: false,
        message: `Tarea con ID ${id} no encontrada`
      });
    }

    // Campos permitidos para actualización parcial
    const camposPermitidos = ['titulo', 'descripcion', 'estado', 'persona_id'];
    const datosParciales = {};

    camposPermitidos.forEach(campo => {
      if (campo in actualizaciones) {
        datosParciales[campo] = actualizaciones[campo];
      }
    });

    // Si se cambio la persona, verificar que existe
    if (datosParciales.persona_id) {
      const persona = await db.Persona.findByPk(datosParciales.persona_id);
      if (!persona) {
        return res.status(404).json({
          success: false,
          message: `Persona con ID ${datosParciales.persona_id} no encontrada`
        });
      }
    }

    await tarea.update(datosParciales);

    // Actualizar tags si se proporcionan
    if (Array.isArray(actualizaciones.tagIds)) {
      await tarea.setTags(actualizaciones.tagIds);
    }

    // Recargar con relaciones
    const tareaActualizada = await findUserTask(id, usuarioId, { include: tareaIncludes() });

    res.json({
      success: true,
      message: 'Tarea actualizada exitosamente',
      data: tareaActualizada
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar tarea',
      error: error.message
    });
  }
};

/**
 * DELETE /api/tareas/:id - Eliminar una tarea
 */
const eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = getUsuarioId(req);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido. Debe ser un número'
      });
    }

    const tarea = await findUserTask(id, usuarioId);
    if (!tarea) {
      return res.status(404).json({
        success: false,
        message: `Tarea con ID ${id} no encontrada`
      });
    }

    // Eliminar relaciones con tags
    await tarea.setTags([]);

    // Luego eliminar la tarea
    await tarea.destroy();

    res.json({
      success: true,
      message: 'Tarea eliminada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar tarea',
      error: error.message
    });
  }
};

// ============================================================================
// BÚSQUEDAS Y FILTROS
// ============================================================================

/**
 * GET /api/tareas/buscar?titulo= - Buscar tareas por título o descripción
 */
const buscarPorTitulo = async (req, res) => {
  try {
    const { titulo, descripcion, estado } = req.query;
    const usuarioId = getUsuarioId(req);
    const tagIds = parseIds(req.query.tagIds);

    if (!titulo && !descripcion && !tagIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Proporciona al menos un parámetro de búsqueda: titulo, descripcion o tagIds'
      });
    }

    const where = canUseAdminScope(req) ? {} : { usuario_id: usuarioId };
    if (titulo) where.titulo = { [Op.like]: `%${titulo}%` };
    if (descripcion) where.descripcion = { [Op.like]: `%${descripcion}%` };
    if (estado) where.estado = estado;

    const tareas = await db.Tarea.findAll({
      where,
      include: tareaIncludes(tagIds),
      distinct: true
    });

    res.json({
      success: true,
      data: tareas,
      total: tareas.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al buscar tareas',
      error: error.message
    });
  }
};

// ============================================================================
// RELACIONES - TAREAS ↔ TAGS
// ============================================================================

/**
 * GET /api/tareas/:id/tags - Obtener todos los tags de una tarea
 */
const obtenerTags = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = getUsuarioId(req);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido. Debe ser un número'
      });
    }

    const tarea = await findUserTask(id, usuarioId);
    if (!tarea) {
      return res.status(404).json({
        success: false,
        message: `Tarea con ID ${id} no encontrada`
      });
    }

    const tags = await tarea.getTags({
      attributes: ['id', 'nombre']
    });

    res.json({
      success: true,
      data: {
        tarea: {
          id: tarea.id,
          titulo: tarea.titulo
        },
        tags,
        total: tags.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener tags de tarea',
      error: error.message
    });
  }
};

/**
 * POST /api/tareas/:id/tags/:tagId - Asignar un tag a una tarea
 */
const asignarTag = async (req, res) => {
  try {
    const { id, tagId } = req.params;
    const usuarioId = getUsuarioId(req);

    if (isNaN(id) || isNaN(tagId)) {
      return res.status(400).json({
        success: false,
        message: 'IDs inválidos. Deben ser números'
      });
    }

    const tarea = await findUserTask(id, usuarioId);
    if (!tarea) {
      return res.status(404).json({
        success: false,
        message: `Tarea con ID ${id} no encontrada`
      });
    }

    const tag = await db.Tag.findByPk(tagId);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: `Tag con ID ${tagId} no encontrado`
      });
    }

    await tarea.addTag(tag);

    res.json({
      success: true,
      message: 'Tag asignado a tarea exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al asignar tag a tarea',
      error: error.message
    });
  }
};

/**
 * DELETE /api/tareas/:id/tags/:tagId - Desasignar un tag de una tarea
 */
const desasignarTag = async (req, res) => {
  try {
    const { id, tagId } = req.params;
    const usuarioId = getUsuarioId(req);

    if (isNaN(id) || isNaN(tagId)) {
      return res.status(400).json({
        success: false,
        message: 'IDs inválidos. Deben ser números'
      });
    }

    const tarea = await findUserTask(id, usuarioId);
    if (!tarea) {
      return res.status(404).json({
        success: false,
        message: `Tarea con ID ${id} no encontrada`
      });
    }

    const tag = await db.Tag.findByPk(tagId);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: `Tag con ID ${tagId} no encontrado`
      });
    }

    await tarea.removeTag(tag);

    res.json({
      success: true,
      message: 'Tag desasignado de tarea exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al desasignar tag de tarea',
      error: error.message
    });
  }
};

export default {
  obtenerTodas,
  obtenerPorId,
  crear,
  actualizarCompleta,
  actualizarParcial,
  eliminar,
  buscarPorTitulo,
  obtenerTags,
  asignarTag,
  desasignarTag
};
