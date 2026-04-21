module.exports = (sequelize, DataTypes) => {
  const Persona = sequelize.define('Persona', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  }, {
    tableName: 'personas',
    timestamps: true,
    underscored: true
  });

  Persona.associate = (models) => {
    // Una persona puede tener muchas tareas
    Persona.hasMany(models.Tarea, {
      foreignKey: 'persona_id',
      as: 'tareas'
    });
  };

  return Persona;
};
