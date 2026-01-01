import { create } from 'zustand';
import authService from '../services/authService';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    set({ token });
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authService.login(email, password);
      const { token, ...user } = data;
      set({
        user,
        token,
        isLoading: false,
      });
      localStorage.setItem('token', token);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  signup: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authService.signup(userData);
      const { token, ...user } = data;
      set({
        user,
        token,
        isLoading: false,
      });
      localStorage.setItem('token', token);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({ user: null, token: null });
      localStorage.removeItem('token');
    }
  },

  getProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authService.getProfile();
      set({ user: data, isLoading: false });
      return data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  updateProfile: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authService.updateProfile(userData);
      set({ user: data, isLoading: false });
      return data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
