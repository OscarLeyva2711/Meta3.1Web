module.exports = (sequelize, DataTypes) => {
  const Tag = sequelize.define('Tag', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  }, {
    tableName: 'tags',
    timestamps: true,
    underscored: true
  });

  Tag.associate = (models) => {
    // Un tag puede estar relacionado con muchas tareas
    Tag.belongsToMany(models.Tarea, {
      through: 'tarea_tags',
      foreignKey: 'tag_id',
      otherKey: 'tarea_id',
      as: 'tareas'
    });
  };

  return Tag;
};
