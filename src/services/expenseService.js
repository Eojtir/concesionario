/* eslint-disable no-unused-vars */
// src/services/expenseService.js
import api from './api';

const expenseService = {

  getAll: async (filters = {}) => {
    // Si algún filtro viene vacío o undefined, lo limpiamos antes de enviar
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== "" && value !== null && value !== undefined)
    );

    // Axios transformará { vehicle_id: 14, start_date: '2026-03-01' } 
    // automáticamente en: /api_expenses?vehicle_id=14&start_date=2026-03-01
    const response = await api.get('/api_expenses/', { params: cleanFilters });
    return response.data;
  },

  /**
   * ➕ Registrar un nuevo gasto
   * Payload típico: { vehicle_id, description, amount, expense_date, category }
   * Nota: Si es un gasto general de la empresa, vehicle_id puede ir null o vacío.
   */
  create: async (expenseData) => {
    const response = await api.post('/api_expenses/', expenseData);
    return response.data;
  },

  /**
   * 📝 Actualizar un gasto existente
   */
  update: async (id, expenseData) => {
    const response = await api.put(`/api_expenses/?id=${id}`, expenseData);
    return response.data;
  },

  /**
   * ❌ Eliminar un gasto
   */

  
  delete: async (id) => {
    const response = await api.delete(`/api_expenses/?id=${id}`);
    return response.data;
  }
};

export default expenseService;