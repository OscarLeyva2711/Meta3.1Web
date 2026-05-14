import { apiClient } from './authService';

const BASE = '/tareas';

/**
 * Adapta un payload del frontend (con `completada` boolean) al esquema del
 * backend (con `estado` enum). La pertenencia de la tarea la decide el backend
 * con el usuario autenticado del JWT.
 */
function toBackend(payload, { isPatch = false } = {}) {
  const out = { ...payload };

  if ('completada' in out) {
    out.estado = out.completada ? 'completada' : 'pendiente';
    delete out.completada;
  }

  // Limpiar campos que el backend no acepta o calcula
  delete out.id;
  delete out.createdAt;
  delete out.updatedAt;
  delete out.persona;
  delete out.usuario;
  delete out.tags;

  return out;
}

/**
 * Adapta una tarea del backend al modelo que usa el frontend (añade `completada`
 * derivado de `estado`).
 */
function fromBackend(tarea) {
  if (!tarea) return tarea;
  return {
    ...tarea,
    completada: tarea.estado === 'completada'
  };
}

function unwrapList(res) {
  if (res && Array.isArray(res.data)) {
    return { ...res, data: res.data.map(fromBackend) };
  }
  return res;
}

function unwrapOne(res) {
  if (res && res.data) {
    return { ...res, data: fromBackend(res.data) };
  }
  return res;
}

export const tareaService = {
  getAll: (params = {}) =>
    apiClient.get(BASE, { params }).then(r => unwrapList(r.data)),

  getById: (id) =>
    apiClient.get(`${BASE}/${id}`).then(r => unwrapOne(r.data)),

  buscar: (q, params = {}) =>
    apiClient.get(`${BASE}/buscar`, { params: { ...params, ...(q ? { titulo: q } : {}) } }).then(r => unwrapList(r.data)),

  crear: (datos) =>
    apiClient.post(BASE, toBackend(datos)).then(r => unwrapOne(r.data)),

  actualizar: (id, datos) =>
    apiClient.put(`${BASE}/${id}`, toBackend(datos)).then(r => unwrapOne(r.data)),

  actualizarParcial: (id, datos) =>
    apiClient.patch(`${BASE}/${id}`, toBackend(datos, { isPatch: true })).then(r => unwrapOne(r.data)),

  patchCompletar: (id, completada) =>
    apiClient.patch(`${BASE}/${id}`, { estado: completada ? 'completada' : 'pendiente' })
      .then(r => unwrapOne(r.data)),

  eliminar: (id) =>
    apiClient.delete(`${BASE}/${id}`).then(r => r.data)
};
