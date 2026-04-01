import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as api from '../utils/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      loading: true,
      error: null,

      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      checkAuth: async () => {
        set({ loading: true });
        try {
          const user = await api.getMe();
          set({ user, loading: false, error: null });
          return user;
        } catch (error) {
          set({ user: null, loading: false, error: error.message });
          return null;
        }
      },

      login: async (username, password) => {
        set({ loading: true, error: null });
        try {
          const user = await api.login(username, password);
          set({ user, loading: false });
          return user;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      register: async (username, password) => {
        set({ loading: true, error: null });
        try {
          const user = await api.register(username, password);
          set({ user, loading: false });
          return user;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await api.logout();
        } catch (error) {
          console.error('Logout error:', error);
        }
        set({ user: null, error: null });
      },

      updateUser: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null
        }));
      }
    }),
    {
      name: 'pafos-auth',
      partialize: (state) => ({ user: state.user })
    }
  )
);

export const useAuth = () => {
  const {
    user,
    loading,
    error,
    login,
    register,
    logout,
    checkAuth,
    updateUser,
    setUser
  } = useAuthStore();

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    checkAuth,
    updateUser,
    setUser,
    isAuthenticated: !!user
  };
};
