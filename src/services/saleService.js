import api from './api';

const saleService = {
  create: async (data) => {
        const response = await api.post('/api_sales/', data);
    return response.data;
  }
};

export default saleService;