module.exports = (sequelize, DataTypes) => {
  const Tarea = sequelize.define('Tarea', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    titulo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    estado: {
      type: DataTypes.ENUM('pendiente', 'en_progreso', 'completada'),
      defaultValue: 'pendiente'
    },
    persona_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'personas',
        key: 'id'
      }
    }
  }, {
    tableName: 'tareas',
    timestamps: true,
    underscored: true
  });

  Tarea.associate = (models) => {
    // Una tarea pertenece a una persona
    Tarea.belongsTo(models.Persona, {
      foreignKey: 'persona_id',
      as: 'persona'
    });

    // Una tarea puede tener muchos tags
    Tarea.belongsToMany(models.Tag, {
      through: 'tarea_tags',
      foreignKey: 'tarea_id',
      otherKey: 'tag_id',
      as: 'tags'
    });
  };

  return Tarea;
};
