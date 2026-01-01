import { create } from 'zustand';
import applicationService from '../services/applicationService';

export const useApplicationStore = create((set) => ({
  applications: [],
  selectedApplication: null,
  isLoading: false,
  error: null,

  applyForJob: async (jobId, applicationData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await applicationService.applyForJob(jobId, applicationData);
      set((state) => ({
        applications: [data, ...state.applications],
        isLoading: false,
      }));
      return data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  getUserApplications: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await applicationService.getUserApplications();
      set({ applications: data, isLoading: false });
      return data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  getEmployerApplications: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await applicationService.getEmployerApplications();
      set({ applications: data, isLoading: false });
      return data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  getApplicationById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await applicationService.getApplicationById(id);
      set({ selectedApplication: data, isLoading: false });
      return data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  updateApplicationStatus: async (id, status) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await applicationService.updateApplicationStatus(id, status);
      set((state) => ({
        applications: state.applications.map((app) => (app._id === id ? data : app)),
        selectedApplication: state.selectedApplication?._id === id ? data : state.selectedApplication,
        isLoading: false,
      }));
      return data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  deleteApplication: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await applicationService.deleteApplication(id);
      set((state) => ({
        applications: state.applications.filter((app) => app._id !== id),
        selectedApplication: state.selectedApplication?._id === id ? null : state.selectedApplication,
        isLoading: false,
      }));
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
