/**
 * Punto de entrada de la aplicación
 */

const app = require('./src/app');
const db = require('./src/models');

const PORT = process.env.PORT || 3000;

// Sincronizar base de datos (sin alter: true para producción)
db.sequelize.sync({ alter: false }).then(() => {
  console.log('✅ Base de datos sincronizada correctamente');
  
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📚 Documentación de endpoints: http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('❌ Error sincronizando la base de datos:', err);
  process.exit(1);
});
