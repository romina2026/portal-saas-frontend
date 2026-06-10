// src/store/auth.store.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      empleado:    null,
      accessToken: null,
      superAdmin:  null,
      superToken:  null,

      setAuth: (empleado, accessToken) =>
        set({ empleado, accessToken }),

      setAccessToken: (accessToken) => set({ accessToken }),

      setSuperAuth: (superAdmin, superToken) =>
        set({ superAdmin, superToken }),

      logout: () => set({ empleado: null, accessToken: null }),

      logoutSuper: () => set({ superAdmin: null, superToken: null }),

      isAuthenticated: () => !!get().accessToken && !!get().empleado,

      isSuperAdmin: () => !!get().superToken && !!get().superAdmin,
    }),
    {
      name: 'portal-saas-auth',
      partialize: (s) => ({
        empleado:    s.empleado,
        accessToken: s.accessToken,
        superAdmin:  s.superAdmin,
        superToken:  s.superToken,
      }),
    }
  )
);