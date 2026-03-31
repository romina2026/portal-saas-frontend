// src/api/auth.api.js
import { api } from './client.js';
export const authApi = {
  login:           (legajo, password)       => api.post('/auth/login', { legajo, password }),
  refresh:         (refreshToken)           => api.post('/auth/refresh', { refreshToken }),
  logout:          (refreshToken)           => api.post('/auth/logout', { refreshToken }),
  cambiarPassword: (passwordActual, passwordNueva) =>
    api.post('/auth/cambiar-password', { passwordActual, passwordNueva }),
};
