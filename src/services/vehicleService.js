import api from './api';

const vehicleService = {
  // Obtener uno solo por ID
  getById: async (id) => {
    const response = await api.get(`/api_vehicles/?id=${id}`);
    return response.data.data;
  },
  // Obtener todos los vehículos
  getAll: async () => {
    // Axios con nuestro interceptor ya manda el Token automáticamente
    const response = await api.get('/api_vehicles/');
    return response.data.data;
  },

  // Obtener vehículos filtrados (ej: solo disponibles)
  getAvailable: async () => {
    const response = await api.get('/api_vehicles/?status=available');
    return response.data.data;
  },

  create: async (vehicleData) => {
    // vehicleData es un objeto: { make: 'Ford', model: 'Focus', ... }
    const response = await api.post('/api_vehicles/', vehicleData);
    return response.data;
  },
// Actualizar
  update: async (id, vehicleData) => {
    const response = await api.put(`/api_vehicles/?id=${id}`, vehicleData);
    return response.data;
  },
//delete
  delete: async (id) => {
    const response = await api.delete(`/api_vehicles/?id=${id}`);
    return response.data;
  }
};

export default vehicleService;