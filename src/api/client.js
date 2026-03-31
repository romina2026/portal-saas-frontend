// src/api/client.js
// Axios configurado con refresh automático de token

import axios from 'axios';
import { useAuthStore } from '../store/auth.store.js';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Adjunta el accessToken a cada request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

// Si el token expiró (401 TOKEN_EXPIRED), lo renueva automáticamente
let renovando = false;
let cola = [];

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    if (err.response?.status === 401 && err.response?.data?.code === 'TOKEN_EXPIRED' && !original._retry) {
      original._retry = true;

      if (renovando) {
        return new Promise((resolve, reject) => {
          cola.push({ resolve, reject, config: original });
        });
      }

      renovando = true;
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        useAuthStore.getState().setAccessToken(data.accessToken);

        // Reintentar requests encolados
        cola.forEach(({ resolve, config }) => {
          config.headers['Authorization'] = `Bearer ${data.accessToken}`;
          resolve(api(config));
        });
        cola = [];

        original.headers['Authorization'] = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        // Refresh falló — logout
        useAuthStore.getState().logout();
        cola.forEach(({ reject }) => reject(new Error('Sesión expirada')));
        cola = [];
        window.location.href = '/login';
      } finally {
        renovando = false;
      }
    }

    return Promise.reject(err);
  }
);
