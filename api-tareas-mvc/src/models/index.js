import fs from 'fs';
import Sequelize from 'sequelize';

import definePersona from './persona.js';
import defineTag from './tag.js';
import defineTarea from './tarea.js';
import defineUsuario from './usuario.js';

const env = process.env.NODE_ENV || 'development';
const configPath = new URL('../../config/config.json', import.meta.url);
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))[env];

const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Inicializar modelos
db.Persona = definePersona(sequelize, Sequelize.DataTypes);
db.Tag = defineTag(sequelize, Sequelize.DataTypes);
db.Tarea = defineTarea(sequelize, Sequelize.DataTypes);
db.Usuario = defineUsuario(sequelize, Sequelize.DataTypes);

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
