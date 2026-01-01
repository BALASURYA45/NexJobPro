import { create } from 'zustand';
import jobService from '../services/jobService';

export const useJobStore = create((set, get) => ({
  jobs: [],
  selectedJob: null,
  isLoading: false,
  error: null,
  filters: {
    search: '',
    category: '',
    location: '',
    salary: { min: 0, max: 0 },
  },

  setFilters: (filters) => set({ filters }),

  getAllJobs: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await jobService.getAllJobs(params);
      set({ jobs: data, isLoading: false });
      return data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  getJobById: async (id) => {
    // If it's an external job, it might already be in our state
    const externalJob = get().jobs.find(j => j._id === id && j.source === 'external');
    if (externalJob) {
      set({ selectedJob: externalJob, isLoading: false });
      return externalJob;
    }

    set({ isLoading: true, error: null });
    try {
      const { data } = await jobService.getJobById(id);
      set({ selectedJob: data, isLoading: false });
      return data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  createJob: async (jobData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await jobService.createJob(jobData);
      set((state) => ({
        jobs: [data, ...state.jobs],
        isLoading: false,
      }));
      return data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  updateJob: async (id, jobData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await jobService.updateJob(id, jobData);
      set((state) => ({
        jobs: state.jobs.map((job) => (job._id === id ? data : job)),
        selectedJob: state.selectedJob?._id === id ? data : state.selectedJob,
        isLoading: false,
      }));
      return data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  deleteJob: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await jobService.deleteJob(id);
      set((state) => ({
        jobs: state.jobs.filter((job) => job._id !== id),
        selectedJob: state.selectedJob?._id === id ? null : state.selectedJob,
        isLoading: false,
      }));
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  searchJobs: async (query) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await jobService.searchJobs(query);
      set({ jobs: data, isLoading: false });
      return data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
