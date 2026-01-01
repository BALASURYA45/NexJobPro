import api from './api';

export const applicationService = {
  applyForJob: (jobId, data) => api.post(`/applications/${jobId}`, data),
  getUserApplications: () => api.get('/applications/user/my-applications'),
  getJobApplications: (jobId) => api.get(`/applications/job/${jobId}`),
  getApplicationById: (id) => api.get(`/applications/${id}`),
  updateApplicationStatus: (id, status) => api.put(`/applications/${id}`, { status }),
  deleteApplication: (id) => api.delete(`/applications/${id}`),
  getEmployerApplications: () => api.get('/applications/employer/my-applications'),
};

export default applicationService;
