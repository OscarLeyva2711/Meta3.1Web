import axios from 'axios';

const API_BASE_URL = 'https://localhost:3000/api';
const API_KEY = 'mi_api_key_secreta_12345';

// Event emitter para cambios de autenticación
const authEventTarget = new EventTarget();

// Cliente Axios con cookies habilitadas
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Rutas en las que NO se debe hacer hard-redirect ante un 401
// (login, callback OAuth y pantalla intermedia de Google).
const SAFE_PATHS = ['/login', '/oauth-callback', '/google-login'];

// Interceptor de request: agrega Bearer (desde localStorage) y CSRF (desde cookie)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  const csrfToken = getCsrfTokenFromCookie();
  if (csrfToken) {
    config.headers['x-csrf-token'] = csrfToken;
  }
  return config;
}, (error) => Promise.reject(error));

// Interceptor de response: maneja 401 sin abortar flujos sensibles
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const path = (typeof window !== 'undefined') ? window.location.pathname : '';
      if (!SAFE_PATHS.includes(path)) {
        clearAuthCookies();
        localStorage.removeItem('authToken');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

function getCsrfTokenFromCookie() {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrf_token') {
      return decodeURIComponent(value);
    }
  }
  return null;
}

function clearAuthCookies() {
  if (typeof document === 'undefined') return;
  document.cookie = 'jwt_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'csrf_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

function decodeJwtPayload(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch (error) {
    return {};
  }
}

export const authService = {
  setAuthData(token, email = null, { emitEvent = true } = {}) {
    const payload = decodeJwtPayload(token);
    localStorage.setItem('authToken', token);
    localStorage.setItem('userEmail', email || payload.email || '');
    localStorage.setItem('userRole', payload.rol || 'usuario');
    if (payload.id) localStorage.setItem('userId', String(payload.id));
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    if (emitEvent) {
      authEventTarget.dispatchEvent(new CustomEvent('login-success'));
    }
  },

  /**
   * Login con email + password (envía AMBOS al backend).
   */
  async login(email, password) {
    try {
      const response = await apiClient.post(
        '/auth/login',
        { email, password },
        { headers: { 'x-api-key': API_KEY } }
      );

      if (response.data.token) {
        this.setAuthData(response.data.token, email);
      }

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
    }
  },

  async logout() {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        this.clearAuthData();
        authEventTarget.dispatchEvent(new CustomEvent('logout'));
        return { success: true, message: 'Sesión cerrada' };
      }

      const response = await apiClient.post('/auth/logout', {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      this.clearAuthData();
      authEventTarget.dispatchEvent(new CustomEvent('logout'));
      return response.data;
    } catch (error) {
      this.clearAuthData();
      authEventTarget.dispatchEvent(new CustomEvent('logout'));
      throw new Error(error.response?.data?.message || 'Error al cerrar sesión');
    }
  },

  clearAuthData() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    delete apiClient.defaults.headers.common['Authorization'];
    clearAuthCookies();
  },

  /**
   * Verifica autenticación con el backend.
   * El backend acepta JWT desde cookie o desde Bearer; el interceptor envía
   * automáticamente el Bearer cuando existe en localStorage.
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
   * Comprobación local rápida: existe token en localStorage o cookies de sesión.
   */
  isAuthenticated() {
    const token = localStorage.getItem('authToken');
    if (token) return true;
    if (typeof document === 'undefined') return false;
    return document.cookie.includes('connect.sid') || document.cookie.includes('jwt_token');
  },

  getUserEmail() {
    return localStorage.getItem('userEmail');
  },

  getUserRole() {
    return localStorage.getItem('userRole') || 'usuario';
  },

  onAuthEvent(eventType, callback) {
    authEventTarget.addEventListener(eventType, callback);
  },

  offAuthEvent(eventType, callback) {
    authEventTarget.removeEventListener(eventType, callback);
  }
};

export { apiClient };
