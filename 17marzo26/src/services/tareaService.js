import { apiClient } from './authService';

const BASE = '/tareas'

export const tareaService = {
  getAll: () =>
    apiClient.get(BASE).then(r => r.data),

  getById: (id) =>
    apiClient.get(`${BASE}/${id}`).then(r => r.data),

  buscar: (q) =>
    apiClient.get(`${BASE}/buscar?q=${q}`).then(r => r.data),

  crear: (datos) =>
    apiClient.post(BASE, datos).then(r => r.data),

  actualizar: (id, datos) =>
    apiClient.put(`${BASE}/${id}`, datos).then(r => r.data),

  patchCompletar: (id, completada) =>
    apiClient.patch(`${BASE}/${id}`, { completada }).then(r => r.data),

  eliminar: (id) =>
    apiClient.delete(`${BASE}/${id}`).then(r => r.data)
}