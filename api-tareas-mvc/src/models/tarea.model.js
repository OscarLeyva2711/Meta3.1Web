/**
 * Modelo de Tarea
 * Define la estructura de datos 
 */

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
    completada: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });

  return Tarea;
};
