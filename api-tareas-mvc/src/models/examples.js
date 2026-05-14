// Ejemplo de cómo usar los modelos en Express

const db = require('./index');

// Sincronizar modelos con la base de datos (alternativa a migrations)
// Ejecutar al iniciar el servidor
async function initializeDatabase() {
  try {
    // Descomentar solo para desarrollo
    // await db.sequelize.sync({ alter: true });
    
    // Para producción, usar migrations
    await db.sequelize.authenticate();
    console.log('✅ Base de datos conectada correctamente');
  } catch (error) {
    console.error('❌ Error al conectar la base de datos:', error);
    process.exit(1);
  }
}

// Ejemplo: Obtener todas las personas con sus tareas
async function getAllPersonasWithTareas() {
  try {
    const personas = await db.Persona.findAll({
      include: {
        association: 'tareas',
        include: {
          association: 'tags'
        }
      }
    });
    return personas;
  } catch (error) {
    console.error('Error al obtener personas:', error);
    throw error;
  }
}

// Ejemplo: Obtener una tarea con sus detalles
async function getTareaWithDetails(tareaId) {
  try {
    const tarea = await db.Tarea.findByPk(tareaId, {
      include: [
        {
          association: 'persona',
          attributes: ['id', 'nombre', 'email']
        },
        {
          association: 'tags'
        }
      ]
    });
    return tarea;
  } catch (error) {
    console.error('Error al obtener tarea:', error);
    throw error;
  }
}

// Ejemplo: Crear una tarea con tags
async function createTareaWithTags(tareaData, tagIds) {
  try {
    const nuevaTarea = await db.Tarea.create({
      titulo: tareaData.titulo,
      descripcion: tareaData.descripcion,
      estado: tareaData.estado || 'pendiente',
      persona_id: tareaData.persona_id
    });

    // Asociar los tags
    if (tagIds && tagIds.length > 0) {
      await nuevaTarea.addTags(tagIds);
    }

    return nuevaTarea;
  } catch (error) {
    console.error('Error al crear tarea:', error);
    throw error;
  }
}

// Ejemplo: Obtener todas las tareas de una persona
async function getTareasByPersona(personaId) {
  try {
    const tareas = await db.Tarea.findAll({
      where: {
        persona_id: personaId
      },
      include: {
        association: 'tags'
      }
    });
    return tareas;
  } catch (error) {
    console.error('Error al obtener tareas de persona:', error);
    throw error;
  }
}

// Ejemplo: Obtener tareas por tag
async function getTareasByTag(tagId) {
  try {
    const tag = await db.Tag.findByPk(tagId, {
      include: {
        association: 'tareas',
        through: { attributes: [] } // Excluir atributos de la tabla intermedia
      }
    });
    return tag;
  } catch (error) {
    console.error('Error al obtener tareas por tag:', error);
    throw error;
  }
}

// Ejemplo: Actualizar una tarea
async function updateTarea(tareaId, updateData) {
  try {
    const tarea = await db.Tarea.findByPk(tareaId);
    
    if (!tarea) {
      throw new Error('Tarea no encontrada');
    }

    await tarea.update({
      titulo: updateData.titulo || tarea.titulo,
      descripcion: updateData.descripcion || tarea.descripcion,
      estado: updateData.estado || tarea.estado
    });

    // Si se proporcionan nuevos tags, reemplazar
    if (updateData.tagIds) {
      await tarea.setTags(updateData.tagIds);
    }

    return tarea;
  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    throw error;
  }
}

// Ejemplo: Eliminar una tarea
async function deleteTarea(tareaId) {
  try {
    const tarea = await db.Tarea.findByPk(tareaId);
    
    if (!tarea) {
      throw new Error('Tarea no encontrada');
    }

    // Los tags se desasocian automáticamente por la relación N:M
    await tarea.destroy();
    return { message: 'Tarea eliminada correctamente' };
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    throw error;
  }
}

module.exports = {
  initializeDatabase,
  getAllPersonasWithTareas,
  getTareaWithDetails,
  createTareaWithTags,
  getTareasByPersona,
  getTareasByTag,
  updateTarea,
  deleteTarea
};
