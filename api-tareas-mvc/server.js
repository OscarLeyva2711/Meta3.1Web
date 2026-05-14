/**
 * Punto de entrada de la aplicación.
 * Levanta servidor HTTPS con certificados autofirmados y sincroniza Sequelize.
 */

const app = require('./src/app');
const db = require('./src/models');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

// Buscar certificados en ../certs (raíz del proyecto) o ./certs (junto al backend)
const candidateDirs = [
  path.join(__dirname, '..', 'certs'),
  path.join(__dirname, 'certs')
];
const certsDir = candidateDirs.find(d =>
  fs.existsSync(path.join(d, 'key.pem')) && fs.existsSync(path.join(d, 'cert.pem'))
);

if (!certsDir) {
  console.error('❌ No se encontraron certificados (key.pem / cert.pem) en:');
  candidateDirs.forEach(d => console.error('   - ' + d));
  process.exit(1);
}

const httpsOptions = {
  key: fs.readFileSync(path.join(certsDir, 'key.pem')),
  cert: fs.readFileSync(path.join(certsDir, 'cert.pem'))
};

db.sequelize.sync({ alter: false })
  .then(() => {
    console.log('✅ Base de datos sincronizada correctamente');
    https.createServer(httpsOptions, app).listen(PORT, () => {
      console.log(`🚀 Servidor HTTPS corriendo en https://localhost:${PORT}`);
      console.log(`📚 Documentación: https://localhost:${PORT}/api-docs`);
      console.log(`🔒 Certificados: ${certsDir}`);
    });
  })
  .catch(err => {
    console.error('❌ Error sincronizando la base de datos:', err);
    process.exit(1);
  });
