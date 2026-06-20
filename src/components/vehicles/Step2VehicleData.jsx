// src/components/vehicles/Step2VehicleData.jsx
import React from "react";
import {
  FiTruck,
  FiTag,
  FiHash,
  FiSettings,
  FiActivity,
  FiTool,
  FiDroplet,
  FiKey,
  FiCalendar,
} from "react-icons/fi";

const Step2VehicleData = ({ 
  formData, 
  handleChange, 
  errors, 
  isEditMode,
  availableMarks = [],   // <-- Recibido desde el Backend vía VehicleWizard
  availableModels = []   // <-- Recibido desde el Backend vía VehicleWizard
}) => {

  // 1. Formateador solo visual (para mostrar en el input con puntos)
  const formatMilometraje = (value) => {
    if (!value) return "";
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // 2. Limpiador (para guardar en el estado global como número entero limpio)
  const handleKilometrajeChange = (e) => {
    const { name, value } = e.target;
    // Quitamos todo lo que no sea número
    const cleanValue = value.replace(/\D/g, "");
    
    // Guardamos como número entero
    handleChange({ 
      target: { 
        name, 
        value: cleanValue === "" ? "" : parseInt(cleanValue, 10), 
        type: "number" 
      } 
    });
  };

  return (
    <div className="p-6 md:p-8 space-y-6 animate-fade-in">
      <div className="flex justify-between items-end mb-6 border-b pb-3">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <FiTruck className="text-blue-600" /> Identificación Técnica del Vehículo
        </h3>
        {/* Mostramos el tipo seleccionado en el Paso 0 a modo informativo */}
        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          {formData.tipo_vehiculo || "No clasificado"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Marca (Ahora dinámica desde la API) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Marca *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiTag className="text-gray-400" />
            </div>
            <select
              name="mark_id"
              value={formData.mark_id}
              onChange={handleChange}
              className={`block w-full pl-10 pr-3 py-2.5 border ${errors.mark_id ? "border-red-300" : "border-gray-300"} rounded-lg shadow-sm focus:ring-blue-500 sm:text-sm bg-white`}
            >
              <option value="">Seleccione marca...</option>
              {availableMarks.map((mark) => (
                <option key={mark.id} value={mark.id}>
                  {mark.name}
                </option>
              ))}
            </select>
          </div>
          {errors.mark_id && (
            <p className="mt-1 text-sm text-red-600">{errors.mark_id}</p>
          )}
        </div>

        {/* Modelo (Ahora dinámico desde la API) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Modelo *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSettings className="text-gray-400" />
            </div>
            <select
              name="model_id"
              value={formData.model_id}
              onChange={handleChange}
              disabled={!formData.mark_id}
              className={`block w-full pl-10 pr-3 py-2.5 border ${errors.model_id ? "border-red-300" : "border-gray-300"} rounded-lg shadow-sm focus:ring-blue-500 sm:text-sm bg-white disabled:bg-gray-100 disabled:text-gray-400 cursor-pointer`}
            >
              <option value="">Seleccione modelo...</option>
              {availableModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>
          {errors.model_id && (
            <p className="mt-1 text-sm text-red-600">{errors.model_id}</p>
          )}
        </div>

        {/* Kilometraje (Con separador de miles dinámico) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kilometraje *
          </label>
          <input
            type="text"
            name="kilometraje"
            value={formData.kilometraje ? formatMilometraje(formData.kilometraje) : ""} 
            onChange={handleKilometrajeChange} 
            placeholder="Ej: 75.000"
            className={`block w-full px-3 py-2.5 border ${errors.kilometraje ? "border-red-300" : "border-gray-300"} rounded-lg shadow-sm focus:ring-blue-500 sm:text-sm`}
          />
        </div>
        
        {/* Año */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Año *
          </label>
          <input
            type="number"
            name="year"
            value={formData.year}
            onChange={handleChange}
            min="1990"
            max={new Date().getFullYear() + 1}
            className={`block w-full px-3 py-2.5 border ${errors.year ? "border-red-300" : "border-gray-300"} rounded-lg shadow-sm focus:ring-blue-500 sm:text-sm`}
          />
          {errors.year && (
            <p className="mt-1 text-sm text-red-600">{errors.year}</p>
          )}
        </div>

        {/* Patente */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Patente (PPU) *
          </label>
          <input
            type="text"
            name="plate"
            value={formData.plate}
            onChange={handleChange}
            placeholder="ABCD12"
            maxLength={7}
            className={`block w-full px-3 py-2.5 border ${errors.plate ? "border-red-300" : "border-gray-300"} rounded-lg shadow-sm focus:ring-blue-500 sm:text-sm uppercase`}
          />
          {errors.plate && (
            <p className="mt-1 text-sm text-red-600">{errors.plate}</p>
          )}
        </div>

        {/* VIN */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            VIN / Nro de Chasis *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiHash className="text-gray-400" />
            </div>
            <input
              type="text"
              name="vin"
              value={formData.vin}
              onChange={handleChange}
              placeholder="17 caracteres"
              maxLength={17}
              className={`block w-full pl-10 pr-3 py-2.5 border ${errors.vin ? "border-red-300" : "border-gray-300"} rounded-lg shadow-sm focus:ring-blue-500 sm:text-sm uppercase`}
            />
          </div>
          {errors.vin && (
            <p className="mt-1 text-sm text-red-600">{errors.vin}</p>
          )}
        </div>

        {/* Nro Motor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nro de Motor *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiTool className="text-gray-400" />
            </div>
            <input
              type="text"
              name="nro_motor"
              value={formData.nro_motor}
              onChange={handleChange}
              placeholder="Ej: 1NZ-FE12345"
              className={`block w-full pl-10 pr-3 py-2.5 border ${errors.nro_motor ? "border-red-300" : "border-gray-300"} rounded-lg shadow-sm focus:ring-blue-500 sm:text-sm uppercase`}
            />
          </div>
          {errors.nro_motor && (
            <p className="mt-1 text-sm text-red-600">{errors.nro_motor}</p>
          )}
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color *
          </label>
          <input
            type="text"
            name="color"
            value={formData.color}
            onChange={handleChange}
            placeholder="Ej: Blanco Perla"
            className={`block w-full px-3 py-2.5 border ${errors.color ? "border-red-300" : "border-gray-300"} rounded-lg shadow-sm focus:ring-blue-500 sm:text-sm`}
          />
          {errors.color && (
            <p className="mt-1 text-sm text-red-600">{errors.color}</p>
          )}
        </div>

        {/* Combustible */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Combustible *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiDroplet className="text-gray-400" />
            </div>
            <select
              name="combustible"
              value={formData.combustible}
              onChange={handleChange}
              className={`block w-full pl-10 pr-3 py-2.5 border ${errors.combustible ? "border-red-300" : "border-gray-300"} rounded-lg shadow-sm focus:ring-blue-500 sm:text-sm bg-white`}
            >
              <option value="GASOLINA">Gasolina</option>
              <option value="DIESEL">Diésel</option>
              <option value="ELECTRICO">Eléctrico</option>
              <option value="HIBRIDO">Híbrido</option>
              <option value="GAS">Gas (GNC/GLP)</option>
            </select>
          </div>
          {errors.combustible && (
            <p className="mt-1 text-sm text-red-600">{errors.combustible}</p>
          )}
        </div>

        {/* Llaves */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nro de Llaves *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiKey className="text-gray-400" />
            </div>
            <input
              type="number"
              name="nro_llaves"
              value={formData.nro_llaves}
              onChange={handleChange}
              min="1"
              max="10"
              className={`block w-full pl-10 pr-3 py-2.5 border ${errors.nro_llaves ? "border-red-300" : "border-gray-300"} rounded-lg shadow-sm focus:ring-blue-500 sm:text-sm`}
            />
          </div>
          {errors.nro_llaves && (
            <p className="mt-1 text-sm text-red-600">{errors.nro_llaves}</p>
          )}
        </div>

        {/* Vcto Revisión Técnica */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vcto. Revisión Técnica *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiCalendar className="text-gray-400" />
            </div>
            <input
              type="date"
              name="vcto_rev_tecnica"
              value={formData.vcto_rev_tecnica}
              onChange={handleChange}
              className={`block w-full pl-10 pr-3 py-2.5 border ${errors.vcto_rev_tecnica ? "border-red-300" : "border-gray-300"} rounded-lg shadow-sm focus:ring-blue-500 sm:text-sm`}
            />
          </div>
          {errors.vcto_rev_tecnica && (
            <p className="mt-1 text-sm text-red-600">
              {errors.vcto_rev_tecnica}
            </p>
          )}
        </div>

        {isEditMode && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado del Vehículo
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiActivity className="text-gray-400" />
              </div>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 sm:text-sm bg-white"
              >
                <option value="available">Disponible</option>
                <option value="reserved">Reservado</option>
                <option value="sold">Vendido</option>
                <option value="maintenance">En Mantenimiento</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Step2VehicleData;