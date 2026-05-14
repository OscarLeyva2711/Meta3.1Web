import { apiClient } from './authService';

export const tagService = {
  getAll: () => apiClient.get('/tags').then(r => r.data),
  crear: (nombre) => apiClient.post('/tags', { nombre }).then(r => r.data),
  buscar: (params = {}) => apiClient.get('/tags/buscar', { params }).then(r => r.data)
};
