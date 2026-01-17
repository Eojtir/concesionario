import api from './api';

const expenseService = {
  // Obtener gastos de un auto específico
  getByVehicle: async (vehicleId) => {
    const response = await api.get(`/api_expenses/?vehicle_id=${vehicleId}`);
    return response.data.data;
  },

  // Crear gasto
  create: async (data) => {
    // data debe incluir: { vehicle_id, description, category, amount, date }
    const response = await api.post('/api_expenses/', data);
    return response.data;
  },

  // Eliminar gasto
  delete: async (expenseId) => {
    const response = await api.delete(`/api_expenses/?id=${expenseId}`);
    return response.data;
  }
};

export default expenseService;