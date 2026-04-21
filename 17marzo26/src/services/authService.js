import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';
const API_KEY = 'mi_api_key_secreta_12345';

// Event emitter para cambios de autenticación
const authEventTarget = new EventTarget();

// Configuración de Axios con manejo de cookies
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Importante para enviar cookies HTTP-Only
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para añadir token CSRF a las solicitudes
apiClient.interceptors.request.use((config) => {
  // Obtener token CSRF de las cookies
  const csrfToken = getCsrfTokenFromCookie();
  console.log('CSRF Token encontrado:', csrfToken);
  console.log('Cookies disponibles:', document.cookie);
  
  if (csrfToken) {
    config.headers['x-csrf-token'] = csrfToken;
    console.log('CSRF Token añadido al header:', config.headers['x-csrf-token']);
  } else {
    console.warn('No se encontró token CSRF en las cookies');
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor para manejar errores de autenticación
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido, redirigir al login
      clearAuthCookies();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Función auxiliar para obtener token CSRF de las cookies
function getCsrfTokenFromCookie() {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrf_token') {
      return decodeURIComponent(value);
    }
  }
  return null;
}

// Función para limpiar cookies de autenticación
function clearAuthCookies() {
  document.cookie = 'jwt_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'csrf_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

export const authService = {
  /**
   * Iniciar sesión con email y contraseña
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @returns {Promise} Respuesta del servidor con token JWT
   */
  async login(email, password) {
    try {
      const response = await apiClient.post('/auth/login', 
        { email },
        {
          headers: {
            'x-api-key': API_KEY
          }
        }
      );
      
      // Emitir evento de login exitoso
      if (response.data.success) {
        authEventTarget.dispatchEvent(new CustomEvent('login-success'));
      }
      
      // Guardar token si viene en la respuesta
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        // Añadir token a los headers para futuras peticiones
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
    }
  },

  /**
   * Cerrar sesión
   * @returns {Promise} Respuesta del servidor
   */
  async logout() {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        // Si no hay token, solo limpiar datos locales
        this.clearAuthData();
        authEventTarget.dispatchEvent(new CustomEvent('logout'));
        return { success: true, message: 'Sesión cerrada' };
      }
      
      const response = await apiClient.post('/auth/logout', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Limpiar datos locales independientemente de la respuesta
      this.clearAuthData();
      authEventTarget.dispatchEvent(new CustomEvent('logout'));
      return response.data;
    } catch (error) {
      // Limpiar datos locales incluso si hay error
      this.clearAuthData();
      authEventTarget.dispatchEvent(new CustomEvent('logout'));
      throw new Error(error.response?.data?.message || 'Error al cerrar sesión');
    }
  },

  /**
   * Limpiar datos de autenticación
   */
  clearAuthData() {
    localStorage.removeItem('authToken');
    delete apiClient.defaults.headers.common['Authorization'];
    clearAuthCookies();
  },

  /**
   * Verificar estado de autenticación
   * @returns {Promise} Respuesta del servidor
   */
  async verify() {
    try {
      // Obtener token del localStorage
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No hay token disponible');
      }
      
      const response = await apiClient.get('/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al verificar autenticación');
    }
  },

  /**
   * Verificar si el usuario está autenticado (verificación local)
   * @returns {boolean} True si está autenticado
   */
  isAuthenticated() {
    const token = localStorage.getItem('authToken');
    return token !== null && token !== '';
  },

  /**
   * Obtener el email del usuario desde las cookies (si es posible)
   * @returns {string|null} Email del usuario o null
   */
  getUserEmail() {
    // Nota: El email está en el JWT que es HTTP-Only, no podemos acceder directamente
    // Esta función podría ser implementada con un endpoint adicional si se necesita
    return null;
  },

  /**
   * Suscribirse a eventos de autenticación
   * @param {string} eventType - Tipo de evento ('login-success', 'logout')
   * @param {Function} callback - Función a ejecutar cuando ocurra el evento
   */
  onAuthEvent(eventType, callback) {
    authEventTarget.addEventListener(eventType, callback);
  },

  /**
   * Cancelar suscripción a eventos de autenticación
   * @param {string} eventType - Tipo de evento
   * @param {Function} callback - Función a cancelar
   */
  offAuthEvent(eventType, callback) {
    authEventTarget.removeEventListener(eventType, callback);
  }
};

// Exportar el cliente axios configurado para usar en otros servicios
export { apiClient };
