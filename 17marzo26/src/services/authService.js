import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';
const API_KEY = 'mi_api_key_secreta_12345';

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
  // Obtener token CSRF de la cookie
  const csrfToken = getCsrfTokenFromCookie();
  if (csrfToken) {
    config.headers['x-csrf-token'] = csrfToken;
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
   * Iniciar sesión
   * @param {string} email - Email del usuario
   * @returns {Promise} Respuesta del servidor
   */
  async login(email) {
    try {
      const response = await apiClient.post('/auth/login', 
        { email },
        {
          headers: {
            'x-api-key': API_KEY
          }
        }
      );
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
      const response = await apiClient.post('/auth/logout');
      clearAuthCookies();
      return response.data;
    } catch (error) {
      clearAuthCookies(); // Limpiar cookies incluso si hay error
      throw new Error(error.response?.data?.message || 'Error al cerrar sesión');
    }
  },

  /**
   * Verificar estado de autenticación
   * @returns {Promise} Respuesta del servidor
   */
  async verify() {
    try {
      const response = await apiClient.get('/auth/verify');
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
    return getCsrfTokenFromCookie() !== null;
  },

  /**
   * Obtener el email del usuario desde las cookies (si es posible)
   * @returns {string|null} Email del usuario o null
   */
  getUserEmail() {
    // Nota: El email está en el JWT que es HTTP-Only, no podemos acceder directamente
    // Esta función podría ser implementada con un endpoint adicional si se necesita
    return null;
  }
};

// Exportar el cliente axios configurado para usar en otros servicios
export { apiClient };
