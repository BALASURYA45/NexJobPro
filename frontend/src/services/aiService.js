import api from './api';

const aiService = {
  analyzeResume: (formData) => api.post('/ai/analyze-resume', formData),
};

export default aiService;
