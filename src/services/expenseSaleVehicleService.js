// src/services/expenseSaleVehicleService.js
import api from "./api";

const BASE_CATALOG_URL = "/api_expense_sale/";
const BASE_VEHICLE_URL = "/api_expense_sale_vehicle/";

const expenseSaleVehicleService = {
  // ============================================
  // CATÁLOGO MAESTRO (api_expense_sale)
  // ============================================

  /** Obtener todo el catálogo de gastos */
  getCatalog: () => api.get(BASE_CATALOG_URL),

  /** Obtener un gasto del catálogo por ID */
  getCatalogById: (id) => api.get(`${BASE_CATALOG_URL}/?id=${id}`),

  /** Crear nuevo concepto en el catálogo */
  createCatalog: (data) => api.post(BASE_CATALOG_URL, data),

  /** Actualizar concepto del catálogo */
  updateCatalog: (id, data) => api.put(`${BASE_CATALOG_URL}/?id=${id}`, data),

  /** Eliminar (soft delete) concepto del catálogo */
  deleteCatalog: (id) => api.delete(`${BASE_CATALOG_URL}/?id=${id}`),

  // ============================================
  // GASTOS POR VEHÍCULO (api_expense_sale_vehicle)
  // ============================================

  /** Obtener gastos asignados a un vehículo */
  getByVehicleId: (vehicleId) => api.get(`${BASE_VEHICLE_URL}/?vehicle_id=${vehicleId}`),

  /** Obtener un gasto específico del vehículo por ID transaccional */
  getById: (id) => api.get(`${BASE_VEHICLE_URL}/?id=${id}`),

  /** Crear/Asignar un gasto a un vehículo */
  create: (data) => api.post(BASE_VEHICLE_URL, data),

  /** Actualizar gasto del vehículo */
  update: (id, data) => api.put(`${BASE_VEHICLE_URL}/?id=${id}`, data),

  /** Eliminar gasto del vehículo (hard delete) */
  delete: (id) => api.delete(`${BASE_VEHICLE_URL}/?id=${id}`),
};

export default expenseSaleVehicleService;
