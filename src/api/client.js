// src/api/client.js
import axios from 'axios';
import { useAuthStore } from '../store/auth.store.js';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const superApi = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

superApi.interceptors.request.use((config) => {
  const token = useAuthStore.getState().superToken;
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

superApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      useAuthStore.getState().logoutSuper();
      window.location.href = '/super/login';
    }
    return Promise.reject(err);
  }
);
