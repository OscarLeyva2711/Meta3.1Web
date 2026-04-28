module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define('Usuario', {
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
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true, // Nullable para usuarios OAuth
      validate: {
        len: [0, 255]
      }
    },
    googleId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    foto: {
      type: DataTypes.STRING,
      allowNull: true
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    rol: {
      type: DataTypes.ENUM('admin', 'usuario', 'visualizador'),
      defaultValue: 'usuario'
    }
  }, {
    tableName: 'usuarios',
    timestamps: true,
    underscored: true,
    hooks: {
      // Hook para hashear la contraseña antes de crear
      beforeCreate: async (usuario) => {
        if (usuario.password) {
          const bcrypt = require('bcryptjs');
          const salt = await bcrypt.genSalt(10);
          usuario.password = await bcrypt.hash(usuario.password, salt);
        }
      },
      // Hook para hashear la contraseña antes de actualizar (si cambia)
      beforeUpdate: async (usuario) => {
        if (usuario.changed('password')) {
          const bcrypt = require('bcryptjs');
          const salt = await bcrypt.genSalt(10);
          usuario.password = await bcrypt.hash(usuario.password, salt);
        }
      }
    }
  });

  // Métodos de instancia
  Usuario.prototype.verificarPassword = async function(passwordIngresada) {
    const bcrypt = require('bcryptjs');
    return await bcrypt.compare(passwordIngresada, this.password);
  };

  Usuario.associate = (models) => {
    // Relaciones futuras si es necesario
  };

  return Usuario;
};
