// src/services/personService.js
import api from './api';

const personService = {
 
  getAll: async () => {
    const response = await api.get('/api_directorio_personas/');
    return response.data; 
    // Retorna: { success: true, data: [...], message: "..." }
  },

  /**
   * 🔍 2. Ver Detalle de una Persona por ID
   * Método: GET
   * URL: /api_directorio_personas?id={id}
   */
  getById: async (id) => {
    const response = await api.get(`/api_directorio_personas/?id=${id}`);
    return response.data;
    // Retorna: { success: true, data: { id, rut, nombre_completo... }, message: "..." }
  },

  /**
   * ➕ 3. Crear Registro en el Directorio
   * Método: POST
   * URL: /api_directorio_personas
   */
  create: async (data) => {
    const response = await api.post('/api_directorio_personas/', data);
    return response.data;
    // Retorna: { success: true, data: { persona_id: X }, message: "..." }
  },

  /**
   * 🔄 4. Actualizar Registro Existente
   * Método: PUT
   * URL: /api_directorio_personas?id={id}
   */
  update: async (id, data) => {
    const response = await api.put(`/api_directorio_personas/?id=${id}`, data);
    return response.data;
    // Retorna: { success: true, data: null, message: "..." }
  },

  /**
   * 🗑️ 5. Eliminar Registro (Borrado Físico)
   * Método: DELETE
   * URL: /api_directorio_personas?id={id}
   */
  delete: async (id) => {
    const response = await api.delete(`/api_directorio_personas/?id=${id}`);
    return response.data;
    // Retorna: { success: true, data: null, message: "..." }
  }
};

export default personService;