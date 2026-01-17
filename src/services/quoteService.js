import api from './api';

const quoteService = {
  getAll: async () => {
    const response = await api.get('/api_quotes/');
    return response.data.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api_quotes/?id=${id}`);
    return response.data.data;
  },

  create: async (data) => {
    const response = await api.post('/api_quotes/', data);
    return response.data;
  }
};

export default quoteService;