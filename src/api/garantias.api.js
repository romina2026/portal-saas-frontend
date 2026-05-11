// src/api/garantias.api.js — agregar en apis.js
export const garantiasApi = {
  // Panel interno
  etapas:              ()                    => api.get('/garantias/etapas'),
  listar:              (params = {})         => api.get('/garantias', { params }),
  getOrden:            (id)                  => api.get(`/garantias/${id}`),
  crear:               (datos)              => api.post('/garantias', datos),
  cambiarEtapa:        (id, datos)          => api.post(`/garantias/${id}/etapa`, datos),
  registrarNotif:      (id, datos)          => api.post(`/garantias/${id}/notificacion`, datos),
  getHistorial:        (id)                  => api.get(`/garantias/${id}/historial`),

  // Portal público (sin auth) — usa fetch directo
  consultaPublica:     (nroOrden)           => api.get(`/garantias/publica/${encodeURIComponent(nroOrden)}`),
};
