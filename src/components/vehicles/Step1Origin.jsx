import React from 'react';
import { FiMapPin, FiCalendar, FiBriefcase, FiUserCheck } from 'react-icons/fi';

const Step1Origin = ({ formData, handleChange, errors, lots = [] }) => {
  return (
    <div className="p-6 md:p-8 space-y-8 animate-fade-in">
      
      {/* SECCIÓN 1: Origen del Vehículo */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FiBriefcase className="text-blue-600" /> 
          ¿Cuál es el origen de este vehículo?
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Opción: PROPIO */}
          <label 
            className={`
              relative flex cursor-pointer rounded-xl border p-5 shadow-sm transition-all
              ${formData.origen_vehiculo === 'PROPIO' 
                ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/50' 
                : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
              }
            `}
          >
            <input 
              type="radio" 
              name="origen_vehiculo" 
              value="PROPIO" 
              className="sr-only"
              checked={formData.origen_vehiculo === 'PROPIO'}
              onChange={handleChange}
            />
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${formData.origen_vehiculo === 'PROPIO' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                  <FiBriefcase className="w-6 h-6" />
                </div>
                <div>
                  <p className={`font-medium ${formData.origen_vehiculo === 'PROPIO' ? 'text-blue-900' : 'text-gray-900'}`}>
                    Vehículo Propio
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Comprado por la empresa para reventa.
                  </p>
                </div>
              </div>
              {formData.origen_vehiculo === 'PROPIO' && (
                <div className="text-blue-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
            </div>
          </label>

          {/* Opción: CONSIGNADO */}
          <label 
            className={`
              relative flex cursor-pointer rounded-xl border p-5 shadow-sm transition-all
              ${formData.origen_vehiculo === 'CONSIGNADO' 
                ? 'border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50/50' 
                : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'
              }
            `}
          >
            <input 
              type="radio" 
              name="origen_vehiculo" 
              value="CONSIGNADO" 
              className="sr-only"
              checked={formData.origen_vehiculo === 'CONSIGNADO'}
              onChange={handleChange}
            />
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${formData.origen_vehiculo === 'CONSIGNADO' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                  <FiUserCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className={`font-medium ${formData.origen_vehiculo === 'CONSIGNADO' ? 'text-indigo-900' : 'text-gray-900'}`}>
                    Vehículo Consignado
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    De un tercero (cliente/proveedor) para venta a comisión.
                  </p>
                </div>
              </div>
              {formData.origen_vehiculo === 'CONSIGNADO' && (
                <div className="text-indigo-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
            </div>
          </label>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* SECCIÓN 2: Ubicación y Fecha */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lote / Ubicación */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lote de Almacenamiento <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiMapPin className="text-gray-400" />
            </div>
            <select
              name="lot_id"
              value={formData.lot_id}
              onChange={handleChange}
              className={`block w-full pl-10 pr-3 py-2.5 border ${
                errors.lot_id ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'
              } rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors bg-white`}
            >
              <option value="">Seleccione un lote...</option>
              {lots.map((lot) => (
                <option key={lot.lot_id || lot.id} value={lot.lot_id || lot.id}>
                  {lot.name} {lot.location ? `(${lot.location})` : ''}
                </option>
              ))}
            </select>
          </div>
          {errors.lot_id && <p className="mt-1 text-sm text-red-600">{errors.lot_id}</p>}
        </div>

        {/* Fecha de Ingreso */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Ingreso <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiCalendar className="text-gray-400" />
            </div>
            <input
              type="date"
              name="entry_date"
              value={formData.entry_date}
              onChange={handleChange}
              className={`block w-full pl-10 pr-3 py-2.5 border ${
                errors.entry_date ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'
              } rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors`}
            />
          </div>
          {errors.entry_date && <p className="mt-1 text-sm text-red-600">{errors.entry_date}</p>}
        </div>
      </div>

    </div>
  );
};

export default Step1Origin;