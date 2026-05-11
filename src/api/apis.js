// src/api/recibos.api.js
import { api } from './client.js';
export const recibosApi = {
  listar:       ()   => api.get('/recibos'),
  getUrlDescarga: (id) => api.get(`/recibos/${id}/url`),
};

// src/api/cuentaCte.api.js — exportado en el mismo archivo por simplicidad
export const cuentaApi = {
  getSaldo:      ()                              => api.get('/cuenta-cte/saldo'),
  getMovimientos: (params = {})                  => api.get('/cuenta-cte/movimientos', { params }),
  sync:          ()                              => api.post('/cuenta-cte/sync'),
};

// src/api/rrhh.api.js
export const rrhhApi = {
  listar:       ()                              => api.get('/rrhh/solicitudes'),
  crear:        (datos)                         => api.post('/rrhh/solicitudes', datos),
  subirAdjunto: (id, base64, mimeType)          =>
    api.post(`/rrhh/solicitudes/${id}/adjunto`, { base64, mimeType }),
};

// src/api/fichajes.api.js
export const fichajesApi = {
  estadoHoy:  ()           => api.get('/fichajes/estado'),
  semana:     ()           => api.get('/fichajes/semana'),
  entrada:    (lat, lng)   => api.post('/fichajes/entrada', { lat, lng }),
  salida:     (lat, lng)   => api.post('/fichajes/salida',  { lat, lng }),
};
export const garantiasApi = {
  etapas:          ()             => api.get('/garantias/etapas'),
  listar:          (params = {})  => api.get('/garantias', { params }),
  getOrden:        (id)           => api.get(`/garantias/${id}`),
  crear:           (datos)        => api.post('/garantias', datos),
  cambiarEtapa:    (id, datos)    => api.post(`/garantias/${id}/etapa`, datos),
  registrarNotif:  (id, datos)    => api.post(`/garantias/${id}/notificacion`, datos),
  getHistorial:    (id)           => api.get(`/garantias/${id}/historial`),
  consultaPublica: (nroOrden)     => api.get(`/garantias/publica/${encodeURIComponent(nroOrden)}`),
};