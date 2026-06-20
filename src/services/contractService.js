// src/services/contractService.js
import api from './api'; 

const contractService = {
  create: async (contractData) => {
    try {
      // Endpoint que apunta a tu API CONTRATOS v1.0
      const response = await api.post('/api_contratos/', contractData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error de conexión' };
    }
  }
};

export default contractService;