// ============================================================================
// REFERENCIA RÁPIDA: Operaciones CRUD con Sequelize
// ============================================================================

const db = require('./index');

// ============================================================================
// PERSONAS
// ============================================================================

// Obtener todas las personas
async function getAllPersonas() {
  return await db.Persona.findAll();
}

// Obtener una persona por ID
async function getPersonaById(id) {
  return await db.Persona.findByPk(id, {
    include: {
      association: 'tareas',
      include: { association: 'tags' }
    }
  });
}

// Obtener persona por email
async function getPersonaByEmail(email) {
  return await db.Persona.findOne({ where: { email } });
}

// Crear persona
async function createPersona(nombre, email) {
  return await db.Persona.create({ nombre, email });
}

// Actualizar persona
async function updatePersona(id, { nombre, email }) {
  const persona = await db.Persona.findByPk(id);
  if (!persona) throw new Error('Persona no encontrada');
  return await persona.update({ nombre, email });
}

// Eliminar persona (y sus tareas por cascada)
async function deletePersona(id) {
  const persona = await db.Persona.findByPk(id);
  if (!persona) throw new Error('Persona no encontrada');
  return await persona.destroy();
}

// ============================================================================
// TAGS
// ============================================================================

// Obtener todos los tags
async function getAllTags() {
  return await db.Tag.findAll();
}

// Obtener tag por ID con sus tareas
async function getTagById(id) {
  return await db.Tag.findByPk(id, {
    include: {
      association: 'tareas',
      through: { attributes: [] }
    }
  });
}

// Crear tag
async function createTag(nombre) {
  return await db.Tag.create({ nombre });
}

// Actualizar tag
async function updateTag(id, nombre) {
  const tag = await db.Tag.findByPk(id);
  if (!tag) throw new Error('Tag no encontrado');
  return await tag.update({ nombre });
}

// Eliminar tag (las asociaciones se borran en cascada)
async function deleteTag(id) {
  const tag = await db.Tag.findByPk(id);
  if (!tag) throw new Error('Tag no encontrado');
  return await tag.destroy();
}

// ============================================================================
// TAREAS
// ============================================================================

// Obtener todas las tareas
async function getAllTareas() {
  return await db.Tarea.findAll({
    include: [
      { association: 'persona' },
      { association: 'tags' }
    ]
  });
}

// Obtener tarea por ID
async function getTareaById(id) {
  return await db.Tarea.findByPk(id, {
    include: [
      { association: 'persona' },
      { association: 'tags' }
    ]
  });
}

// Crear tarea
async function createTarea(tareaData) {
  // tareaData = { titulo, descripcion, estado, persona_id }
  return await db.Tarea.create(tareaData);
}

// Crear tarea con tags
async function createTareaWithTags(tareaData, tagIds) {
  const tarea = await db.Tarea.create(tareaData);
  if (tagIds && tagIds.length > 0) {
    await tarea.addTags(tagIds);
  }
  return await getTareaById(tarea.id);
}

// Actualizar tarea
async function updateTarea(id, updateData) {
  const tarea = await db.Tarea.findByPk(id);
  if (!tarea) throw new Error('Tarea no encontrada');
  
  await tarea.update({
    titulo: updateData.titulo || tarea.titulo,
    descripcion: updateData.descripcion || tarea.descripcion,
    estado: updateData.estado || tarea.estado,
    persona_id: updateData.persona_id || tarea.persona_id
  });
  
  return await getTareaById(id);
}

// Actualizar tarea y sus tags
async function updateTareaWithTags(id, updateData, tagIds) {
  const tarea = await updateTarea(id, updateData);
  
  if (tagIds) {
    await tarea.setTags(tagIds);
  }
  
  return await getTareaById(id);
}

// Eliminar tarea
async function deleteTarea(id) {
  const tarea = await db.Tarea.findByPk(id);
  if (!tarea) throw new Error('Tarea no encontrada');
  return await tarea.destroy();
}

// Obtener tareas por persona
async function getTareasByPersona(personaId) {
  return await db.Tarea.findAll({
    where: { persona_id: personaId },
    include: { association: 'tags' }
  });
}

// Obtener tareas por estado
async function getTareasByEstado(estado) {
  // estado: 'pendiente', 'en_progreso', 'completada'
  return await db.Tarea.findAll({
    where: { estado },
    include: [
      { association: 'persona' },
      { association: 'tags' }
    ]
  });
}

// ============================================================================
// RELACIONES (Tareas y Tags)
// ============================================================================

// Agregar tag a una tarea
async function addTagToTarea(tareaId, tagId) {
  const tarea = await db.Tarea.findByPk(tareaId);
  if (!tarea) throw new Error('Tarea no encontrada');
  await tarea.addTag(tagId);
  return await getTareaById(tareaId);
}

// Agregar múltiples tags a una tarea
async function addTagsToTarea(tareaId, tagIds) {
  const tarea = await db.Tarea.findByPk(tareaId);
  if (!tarea) throw new Error('Tarea no encontrada');
  await tarea.addTags(tagIds);
  return await getTareaById(tareaId);
}

// Remover tag de una tarea
async function removeTagFromTarea(tareaId, tagId) {
  const tarea = await db.Tarea.findByPk(tareaId);
  if (!tarea) throw new Error('Tarea no encontrada');
  await tarea.removeTag(tagId);
  return await getTareaById(tareaId);
}

// Remover todos los tags de una tarea
async function removeAllTagsFromTarea(tareaId) {
  const tarea = await db.Tarea.findByPk(tareaId);
  if (!tarea) throw new Error('Tarea no encontrada');
  await tarea.setTags([]);
  return await getTareaById(tareaId);
}

// Obtener tags de una tarea
async function getTagsForTarea(tareaId) {
  const tarea = await db.Tarea.findByPk(tareaId, {
    include: { association: 'tags' }
  });
  if (!tarea) throw new Error('Tarea no encontrada');
  return tarea.tags;
}

// ============================================================================
// QUERIES COMPLEJAS
// ============================================================================

// Obtener todas las personas con sus tareas y tags (COMPLETO)
async function getAllPersonasComplete() {
  return await db.Persona.findAll({
    include: {
      association: 'tareas',
      include: { association: 'tags' }
    }
  });
}

// Obtener tareas de una persona con tags
async function getPersonaTareasComplete(personaId) {
  return await db.Persona.findByPk(personaId, {
    include: {
      association: 'tareas',
      include: { association: 'tags' }
    }
  });
}

// Obtener estadísticas de tareas por estado
async function getTareasEstadistics() {
  const Sequelize = require('sequelize');
  return await db.Tarea.findAll({
    attributes: [
      'estado',
      [Sequelize.fn('COUNT', Sequelize.col('id')), 'total']
    ],
    group: ['estado']
  });
}

// Obtener personas con cantidad de tareas
async function getPersonasWithTareaCount() {
  const Sequelize = require('sequelize');
  return await db.Persona.findAll({
    attributes: {
      include: [
        [Sequelize.fn('COUNT', Sequelize.col('tareas.id')), 'tareas_total']
      ]
    },
    include: {
      association: 'tareas',
      attributes: []
    },
    group: ['Persona.id'],
    subQuery: false
  });
}

// Obtener tags más usados
async function getMostUsedTags() {
  const Sequelize = require('sequelize');
  return await db.Tag.findAll({
    attributes: {
      include: [
        [Sequelize.fn('COUNT', Sequelize.col('tareas.id')), 'usages']
      ]
    },
    include: {
      association: 'tareas',
      through: { attributes: [] }
    },
    group: ['Tag.id'],
    order: [[Sequelize.literal('usages'), 'DESC']],
    subQuery: false
  });
}

// ============================================================================
// TRANSACCIONES (para operaciones críticas)
// ============================================================================

async function createTareaWithTagsTransaction(tareaData, tagIds) {
  const transaction = await db.sequelize.transaction();
  
  try {
    // Crear tarea dentro de la transacción
    const tarea = await db.Tarea.create(tareaData, { transaction });
    
    // Agregar tags dentro de la transacción
    if (tagIds && tagIds.length > 0) {
      await tarea.addTags(tagIds, { transaction });
    }
    
    // Commit de la transacción
    await transaction.commit();
    
    return await getTareaById(tarea.id);
  } catch (error) {
    // Rollback en caso de error
    await transaction.rollback();
    throw error;
  }
}

// ============================================================================
// VALIDACIONES Y FILTROS
// ============================================================================

// Obtener tareas con filtros
async function getTareasFiltered(filters) {
  // filters = { personaId, estado, tagId }
  const where = {};
  
  if (filters.personaId) {
    where.persona_id = filters.personaId;
  }
  if (filters.estado) {
    where.estado = filters.estado;
  }
  
  let query = {
    where,
    include: [{ association: 'persona' }]
  };
  
  if (filters.tagId) {
    query.include.push({
      association: 'tags',
      where: { id: filters.tagId },
      through: { attributes: [] },
      required: true
    });
  } else {
    query.include.push({
      association: 'tags',
      through: { attributes: [] }
    });
  }
  
  return await db.Tarea.findAll(query);
}

// ============================================================================
// EXPORTAR TODAS LAS FUNCIONES
// ============================================================================

module.exports = {
  // Personas
  getAllPersonas,
  getPersonaById,
  getPersonaByEmail,
  createPersona,
  updatePersona,
  deletePersona,
  
  // Tags
  getAllTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
  
  // Tareas
  getAllTareas,
  getTareaById,
  createTarea,
  createTareaWithTags,
  updateTarea,
  updateTareaWithTags,
  deleteTarea,
  getTareasByPersona,
  getTareasByEstado,
  
  // Relaciones
  addTagToTarea,
  addTagsToTarea,
  removeTagFromTarea,
  removeAllTagsFromTarea,
  getTagsForTarea,
  
  // Queries complejas
  getAllPersonasComplete,
  getPersonaTareasComplete,
  getTareasEstadistics,
  getPersonasWithTareaCount,
  getMostUsedTags,
  
  // Transacciones
  createTareaWithTagsTransaction,
  
  // Filtros
  getTareasFiltered
};
