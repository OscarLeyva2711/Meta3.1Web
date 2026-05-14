import { apiClient } from './authService';

export const usuarioService = {
  getAll: () => apiClient.get('/usuarios').then(r => r.data),
  crear: (datos) => apiClient.post('/usuarios', datos).then(r => r.data),
  actualizar: (id, datos) => apiClient.put(`/usuarios/${id}`, datos).then(r => r.data),
  desactivar: (id) => apiClient.patch(`/usuarios/${id}/desactivar`).then(r => r.data),
  activar: (id) => apiClient.patch(`/usuarios/${id}/activar`).then(r => r.data),
  buscar: (params = {}) => apiClient.get('/usuarios/buscar', { params }).then(r => r.data)
};
