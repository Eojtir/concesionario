// src/services/catalogService.js
import api from './api';

const BASE_PATH = '/api_catalogs/';

const catalogService = {
  /**
   * 🔍 Listar todos los registros de una entidad
   * @param {string} entity - 'types' | 'marks' | 'modelos'
   */
  getAll: async (entity) => {
    const response = await api.get(`${BASE_PATH}?entity=${entity}`);
    return response.data; // Retorna { success, data, message }
  },

  /**
   * 👁️ Obtener un registro por ID
   */
  getById: async (entity, id) => {
    const response = await api.get(`${BASE_PATH}?entity=${entity}&id=${id}`);
    return response.data;
  },

  /**
   * ➕ Crear un nuevo registro
   * @param {string} entity - 'types' | 'marks' | 'modelos'
   * @param {Object} data - Payload correspondiente
   */
  create: async (entity, data) => {
    const response = await api.post(`${BASE_PATH}?entity=${entity}`, data);
    return response.data;
  },

  /**
   * 📝 Actualizar un registro existente
   */
  update: async (entity, id, data) => {
    const response = await api.put(`${BASE_PATH}?entity=${entity}&id=${id}`, data);
    return response.data;
  },

  /**
   * ❌ Eliminar un registro (Lógico para types/marks, Físico para modelos)
   */
  delete: async (entity, id) => {
    const response = await api.delete(`${BASE_PATH}?entity=${entity}&id=${id}`);
    return response.data;
  }
};

export default catalogService;