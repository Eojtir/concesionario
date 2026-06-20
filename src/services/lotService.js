import api from './api';

const lotService = {
  getAll: async () => {
    const response = await api.get('/api_lots/');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api_lots/?id=${id}`);
    return response.data.data;
  },

  create: async (data) => {
    const response = await api.post('/api_lots/', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/api_lots/?id=${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/api_lots/?id=${id}`);
    return response.data;
  }
};

export default lotService;