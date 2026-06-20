// src/services/wizardService.js
import api from './api';

const wizardService = {

  getWizardData: async () => {
    const response = await api.get('/api_wizard_vehiculos/', {
      headers: {
        "X-App-Key": import.meta.env.VITE_APP_KEY || "MI_APP_KEY_SECRETA_REACT"
      }
    });
    
    // Retorna el body completo: { success: true, data: { types, marks, models }, message: "..." }
    return response.data;
  }
};

export default wizardService;