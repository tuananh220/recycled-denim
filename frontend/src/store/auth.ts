'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';

export type Role = 'CUSTOMER' | 'ADMIN' | 'STAFF' | 'DESIGNER' | 'WAREHOUSE';
export interface AuthUser {
  id: string; email: string; name: string; role: Role;
  avatarUrl?: string | null; emailVerified: boolean;
}

interface AuthState {
  user: AuthUser | null;
  hydrated: boolean;            // becomes true once we know real auth state
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  setHydrated: (v: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      hydrated: false,
      accessToken: null,
      refreshToken: null,
      loading: false,
      setHydrated: (v) => set({ hydrated: v }),

      async login(email, password) {
        set({ loading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          localStorage.setItem('indigo.accessToken', data.accessToken);
          localStorage.setItem('indigo.refreshToken', data.refreshToken);
          set({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken, hydrated: true });
        } finally { set({ loading: false }); }
      },
      async register(name, email, password) {
        set({ loading: true });
        try {
          const { data } = await api.post('/auth/register', { name, email, password });
          localStorage.setItem('indigo.accessToken', data.accessToken);
          localStorage.setItem('indigo.refreshToken', data.refreshToken);
          set({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken, hydrated: true });
        } finally { set({ loading: false }); }
      },
      async logout() {
        try { await api.post('/auth/logout'); } catch {}
        localStorage.removeItem('indigo.accessToken');
        localStorage.removeItem('indigo.refreshToken');
        set({ user: null, accessToken: null, refreshToken: null, hydrated: true });
      },
      async fetchMe() {
        // Only call /me if we actually have a token, otherwise we're just guests
        const token = typeof window !== 'undefined' ? localStorage.getItem('indigo.accessToken') : null;
        if (!token) {
          set({ user: null, hydrated: true });
          return;
        }
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data, hydrated: true });
        } catch {
          set({ user: null, hydrated: true });
        }
      },
    }),
    {
      name: 'indigo.auth',
      partialize: (s) => ({ user: s.user }),
      onRehydrateStorage: () => (state) => { state?.setHydrated(true); },
    },
  ),
);
