import api from './api';

export const jobService = {
  getAllJobs: (params) => api.get('/jobs', { params }),
  getJobById: (id) => api.get(`/jobs/${id}`),
  createJob: (data) => api.post('/jobs', data),
  updateJob: (id, data) => api.put(`/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  getEmployerJobs: (employerId) => api.get(`/jobs/employer/${employerId}`),
  searchJobs: (query) => api.get('/jobs/search', { params: { q: query } }),
  translateText: (text) => api.post('/jobs/translate', { text }),
};

export default jobService;
