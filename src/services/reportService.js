// src/services/reportService.js
import api from './api';


const reportService = {

  generateContract: async (id) => {

    const response = await api.get(`/report_contrato/?id=${id}`);
    return response.data;
  }
};

export default reportService;