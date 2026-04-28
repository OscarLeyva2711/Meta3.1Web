/**
 * Punto de entrada de la aplicación
 */

const app = require('./src/app');
const db = require('./src/models');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;

// Opciones para HTTPS con certificados autofirmados
const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, '../certs/key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '../certs/cert.pem'))
};

// Sincronizar base de datos (sin alter: true para producción)
db.sequelize.sync({ alter: false }).then(() => {
  console.log('✅ Base de datos sincronizada correctamente');
  
  // Crear servidor HTTPS
  https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log(`� Servidor HTTPS corriendo en https://localhost:${PORT}`);
    console.log(`📚 Documentación de endpoints: https://localhost:${PORT}`);
    console.log(`🔒 Usando certificados autofirmados para desarrollo`);
  });
}).catch(err => {
  console.error('❌ Error sincronizando la base de datos:', err);
  process.exit(1);
});
