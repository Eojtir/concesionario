// src/components/sales/mockData.js

export const mockVehicle = {
  id: 1,
  make: "TOYOTA",
  model: "HILUX",
  year: 2023,
  plate: "BB-BB-11",
  sale_price: 8990000,
  color: "Blanco",
  vin: "JTFLU71J9B5041234",
  km: 15000,
};

export const mockClient = {
  id: 45,
  nombre_completo: "JUAN PÉREZ GONZÁLEZ",
  rut: "12.345.678-9",
  direccion: "Av. Las Condes 1234, Santiago",
  telefono: "+56 9 1234 5678",
  email: "juan.perez@email.cl",
};

export const mockReferenceValues = {
  fecha_facturacion: new Date().toISOString().split("T")[0],
  permiso_circulacion: { referencia: 0, cobro: false, paga_cliente: 0, tramite: false, valor_regalo: 0, paga_credito_ext: 0 },
  inscripcion_rnvm: { referencia: 169180, cobro: true, paga_cliente: 169180, tramite: true, valor_regalo: 0, paga_credito_ext: 0 },
  seguro_obligatorio: { referencia: 0, cobro: false, paga_cliente: 0, tramite: false, valor_regalo: 0, paga_credito_ext: 0 },
  gastos_operacionales: { referencia: 23800, cobro: true, paga_cliente: 23800, tramite: false, valor_regalo: 0, paga_credito_ext: 0 },
  prenda: { referencia: 90000, cobro: true, paga_cliente: 0, tramite: true, valor_regalo: 0, paga_credito_ext: 0 },
  otros: { referencia: 0, cobro: false, paga_cliente: 0, tramite: false, valor_regalo: 0, paga_credito_ext: 0 },
  accesorio_flete: { referencia: 0, cobro: false, paga_cliente: 0, tramite: false, valor_regalo: 0, paga_credito_ext: 0 },
  accesorio_norma: { referencia: 0, cobro: false, paga_cliente: 0, tramite: false, valor_regalo: 0, paga_credito_ext: 0 },
};

export const mockPaymentMethods = {
  efectivo: 0,
  documentos: 0,
  vehiculo_usado: 0,
  credito_externo: 0,
  prepago: 0,
  credito_simple: 0,
  credito_veh_usado: 0,
  letras_pagare: 0,
};

export const mockSaleConfig = {
  iva_rate: 0.19,
  interest_rate: 0,
  tramites_default: 192980,
};

export const referenceLabels = {
  permiso_circulacion: "Permiso de Circulación",
  inscripcion_rnvm: "Inscripción RNVM",
  seguro_obligatorio: "Seguro Obligatorio",
  gastos_operacionales: "Gastos Operacionales",
  prenda: "Prenda",
  otros: "Otros",
  accesorio_flete: "Accesorio - Flete",
  accesorio_norma: "Accesorio - Norma",
};