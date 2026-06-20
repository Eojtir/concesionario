// src/services/expenseSaleService.js
import api from './api';

const basePath = '/api_expense_sale/';

const expenseSaleService = {
  /**
   * Obtiene todos los conceptos del catálogo
   */
  getAll: async () => {
    const response = await api.get(basePath);
    return response.data;
  },

  /**
   * Obtiene un concepto específico por ID
   */
  getById: async (id) => {
    const response = await api.get(`${basePath}?id=${id}`);
    return response.data;
  },

  /**
   * Crea un nuevo concepto en el catálogo
   */
  create: async (data) => {
    const response = await api.post(basePath, data);
    return response.data;
  },

  /**
   * Actualiza un concepto existente
   */
  update: async (id, data) => {
    const response = await api.put(`${basePath}?id=${id}`, data);
    return response.data;
  },

  /**
   * Elimina (Soft Delete) un concepto
   */
  delete: async (id) => {
    const response = await api.delete(`${basePath}?id=${id}`);
    return response.data;
  }
};

export default expenseSaleService;