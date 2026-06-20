// src/services/quoteService.js
import api from './api';

const quoteService = {

  createWithPdf: async (quoteData) => {
    try {
      const response = await api.post('/api_cotizacion/', quoteData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { status: 'error', message: 'Error de conexión' };
    }
  },

  // CRUD estándar (para listado, editar, etc.)
  getAll: async (filters = {}) => {
    try {
      const response = await api.get('/api_quotes/', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || { status: 'error', message: 'Error de conexión' };
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/api_quotes/?id=${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { status: 'error', message: 'Error de conexión' };
    }
  },

  create: async (quoteData) => {
    try {
      const response = await api.post('/api_quotes/', quoteData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { status: 'error', message: 'Error de conexión' };
    }
  },

  update: async (id, quoteData) => {
    try {
      const response = await api.put(`/api_quotes/?id=${id}`, quoteData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { status: 'error', message: 'Error de conexión' };
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/api_quotes/?id=${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { status: 'error', message: 'Error de conexión' };
    }
  }
};

export default quoteService;