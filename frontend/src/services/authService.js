import api from './api';

export const authService = {
  signup: (data) => api.post('/auth/register', data),
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  uploadResume: (formData) => api.post('/auth/resume', formData),
};

export default authService;
