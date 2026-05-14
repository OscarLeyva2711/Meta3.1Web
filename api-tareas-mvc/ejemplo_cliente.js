/**
 * Ejemplo de cliente para probar la API con autenticación JWT y CSRF
 */

const axios = require('axios');
const { CookieJar } = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

// Configuración
const API_BASE_URL = 'http://localhost:3000/api';
const API_KEY = 'mi_api_key_secreta_12345';

// Crear cookie jar para manejar cookies automáticamente
const cookieJar = new CookieJar();
const apiClient = wrapper(axios.create({
  baseURL: API_BASE_URL,
  jar: cookieJar,
  withCredentials: true
}));

async function testAPI() {
  console.log('🧪 Iniciando pruebas de API con autenticación JWT y CSRF...\n');

  try {
    // 1. Login - Obtener tokens JWT y CSRF
    console.log('1. 📝 Intentando login...');
    const loginResponse = await apiClient.post('/auth/login', 
      { email: 'usuario@ejemplo.com' },
      {
        headers: {
          'x-api-key': API_KEY
        }
      }
    );

    if (loginResponse.data.success) {
      console.log('✅ Login exitoso');
      console.log('📧 Usuario:', loginResponse.data.data.user.email);
      console.log('🔐 CSRF Token:', loginResponse.data.data.csrfToken.substring(0, 20) + '...');
      
      const csrfToken = loginResponse.data.data.csrfToken;
      
      // 2. Verificar autenticación
      console.log('\n2. 🔍 Verificando autenticación...');
      const verifyResponse = await apiClient.get('/auth/verify', {
        headers: {
          'x-csrf-token': csrfToken
        }
      });
      
      if (verifyResponse.data.success) {
        console.log('✅ Autenticación verificada');
        console.log('👤 Usuario autenticado:', verifyResponse.data.data.user.email);
      }

      // 3. Obtener tareas (requiere autenticación)
      console.log('\n3. 📋 Obteniendo tareas...');
      const tareasResponse = await apiClient.get('/tareas', {
        headers: {
          'x-csrf-token': csrfToken
        }
      });
      
      console.log('✅ Tareas obtenidas');
      console.log('📊 Total de tareas:', tareasResponse.data.data?.length || 0);

      // 4. Crear una nueva tarea
      console.log('\n4. ➕ Creando nueva tarea...');
      const nuevaTarea = {
        titulo: 'Tarea de prueba desde cliente',
        descripcion: 'Esta es una tarea creada desde el script de prueba',
        completada: false
      };

      const crearResponse = await apiClient.post('/tareas', nuevaTarea, {
        headers: {
          'x-csrf-token': csrfToken
        }
      });

      if (crearResponse.data.success) {
        console.log('✅ Tarea creada exitosamente');
        console.log('📝 ID de tarea:', crearResponse.data.data.id);
        console.log('📄 Título:', crearResponse.data.data.titulo);
        
        const tareaId = crearResponse.data.data.id;

        // 5. Actualizar la tarea
        console.log('\n5. ✏️ Actualizando tarea...');
        const actualizarResponse = await apiClient.put(`/tareas/${tareaId}`, {
          titulo: 'Tarea actualizada desde cliente',
          descripcion: 'Descripción actualizada',
          completada: true
        }, {
          headers: {
            'x-csrf-token': csrfToken
          }
        });

        if (actualizarResponse.data.success) {
          console.log('✅ Tarea actualizada');
          console.log('✅ Estado:', actualizarResponse.data.data.completada ? 'Completada' : 'Pendiente');
        }

        // 6. Eliminar la tarea
        console.log('\n6. 🗑️ Eliminando tarea...');
        const eliminarResponse = await apiClient.delete(`/tareas/${tareaId}`, {
          headers: {
            'x-csrf-token': csrfToken
          }
        });

        if (eliminarResponse.data.success) {
          console.log('✅ Tarea eliminada exitosamente');
        }
      }

      // 7. Logout
      console.log('\n7. 🚪 Cerrando sesión...');
      const logoutResponse = await apiClient.post('/auth/logout', {}, {
        headers: {
          'x-csrf-token': csrfToken
        }
      });

      if (logoutResponse.data.success) {
        console.log('✅ Sesión cerrada correctamente');
      }

    } else {
      console.log('❌ Login fallido:', loginResponse.data.message);
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error.response?.data?.message || error.message);
    if (error.response?.status === 401) {
      console.log('🔐 Error de autenticación - Verifica API Key y tokens');
    }
    if (error.response?.status === 403) {
      console.log('🛡️ Error de CSRF - Verifica token CSRF en headers');
    }
  }

  console.log('\n🏁 Pruebas completadas');
}

// Ejecutar pruebas si se corre directamente el script
if (require.main === module) {
  testAPI();
}

module.exports = { testAPI };
