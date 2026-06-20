import api from './api';

const clientService = {
  getAll: async (search = '') => {
    const response = await api.get(`/api_clients/?search=${search}`);
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/api_clients/?id=${id}`);
    return response.data.data[0]; 
  },

  create: async (data) => {
    const response = await api.post('/api_clients/', data);
    return response.data.message;
  },

  update: async (id, data) => {
    const response = await api.put(`/api_clients/?id=${id}`, data);
    return response.data.message;
  }
};

export default clientService;