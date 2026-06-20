import api from './api';

const expenseCategoryService = {
  // Obtener todas las categorías de gastos
  getAll: async () => {
    const response = await api.get('/api_expense_categories/');
    return response.data;
  },

  // Obtener una categoría específica por su ID
  getById: async (id) => {
    const response = await api.get(`/api_expense_categories/?id=${id}`);
    return response.data.data;
  },

  // Crear una nueva categoría de gasto
  create: async (data) => {
    const response = await api.post('/api_expense_categories/', data);
    return response.data;
  },

  // Actualizar una categoría existente
  update: async (id, data) => {
    const response = await api.put(`/api_expense_categories/?id=${id}`, data);
    return response.data;
  },

  // Eliminar una categoría
  delete: async (id) => {
    const response = await api.delete(`/api_expense_categories/?id=${id}`);
    return response.data;
  }
};

export default expenseCategoryService;