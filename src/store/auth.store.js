// src/store/auth.store.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      empleado:     null,
      accessToken:  null,
      refreshToken: null,

      setAuth: (empleado, accessToken, refreshToken) =>
        set({ empleado, accessToken, refreshToken }),

      setAccessToken: (accessToken) => set({ accessToken }),

      logout: () => set({ empleado: null, accessToken: null, refreshToken: null }),

      isAuthenticated: () => !!get().accessToken && !!get().empleado,
    }),
    {
      name: 'portal-auth', // clave en localStorage
      partialize: (s) => ({
        empleado:     s.empleado,
        refreshToken: s.refreshToken,
        // accessToken NO se persiste — se renueva con refresh al reabrir
      }),
    }
  )
);
