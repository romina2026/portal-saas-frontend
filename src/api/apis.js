// src/api/apis.js
import { api } from './client.js';

export const recibosApi = {
  listar:         ()    => api.get('/recibos'),
  getUrlDescarga: (id)  => api.get(`/recibos/${id}/url`),
};

export const cuentaApi = {
  getSaldo:       ()             => api.get('/cuenta-cte/saldo'),
  getMovimientos: (params = {})  => api.get('/cuenta-cte/movimientos', { params }),
};

export const rrhhApi = {
  listar: ()       => api.get('/rrhh/solicitudes'),
  crear:  (datos)  => api.post('/rrhh/solicitudes', datos),
};

export const fichajesApi = {
  estadoHoy: ()           => api.get('/fichajes/estado'),
  semana:    ()           => api.get('/fichajes/semana'),
  entrada:   (lat, lng)   => api.post('/fichajes/entrada', { lat, lng }),
  salida:    (lat, lng)   => api.post('/fichajes/salida',  { lat, lng }),
};
