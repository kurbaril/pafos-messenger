import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';
import toast from 'react-hot-toast';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: true,
      
      checkAuth: async () => {
        try {
          const response = await api.get('/auth/me');
          set({ user: response.data, loading: false });
          return response.data;
        } catch (error) {
          set({ user: null, loading: false });
          return null;
        }
      },
      
      login: async (username, password) => {
        const response = await api.post('/auth/login', { username, password });
        if (response.data.success) {
          set({ user: response.data.user });
          return response.data.user;
        }
        throw new Error('Login failed');
      },
      
      register: async (username, password) => {
        const response = await api.post('/auth/register', { username, password });
        if (response.data.success) {
          set({ user: response.data.user });
          return response.data.user;
        }
        throw new Error('Registration failed');
      },
      
      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch (error) {
          console.error('Logout error:', error);
        }
        set({ user: null });
      },
      
      updateProfile: async (data) => {
        const response = await api.put('/profile', data);
        set((state) => ({ user: { ...state.user, ...response.data } }));
        return response.data;
      },
      
      updateAvatar: async (avatarUrl) => {
        set((state) => ({ user: { ...state.user, avatarUrl } }));
      }
    }),
    {
      name: 'pafos-auth',
      getStorage: () => localStorage,
    }
  )
);

export const useAuth = () => {
  const { user, loading, checkAuth, login, register, logout, updateProfile, updateAvatar } = useAuthStore();
  return { user, loading, checkAuth, login, register, logout, updateProfile, updateAvatar };
};