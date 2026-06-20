// src/components/vehicles/Step3Financial.jsx
import React, { useState } from "react";
import {
  FiDollarSign,
  FiUser,
  FiCalendar,
  FiTrendingDown,
  FiPercent,
  FiBriefcase,
  FiAlertTriangle,
  FiCheckSquare,
  FiTrendingUp,
} from "react-icons/fi";
import { formatMoney } from "../../utils/formatters";
import PersonFormModal from "../directory/PersonFormModal"; // <-- 1. Importamos el Modal

const Step3Financial = ({
  formData,
  handleChange,
  errors,
  mockProveedores,
  onRefreshProviders, // <-- 2. Nueva prop para refrescar la lista al guardar
}) => {
  const isConsignado = formData.origen_vehiculo === "CONSIGNADO";
  
  // 3. Estado para controlar la apertura del modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMoneyInputChange = (e) => {
    const { name, value } = e.target;
    const cleanValue = value.replace(/\D/g, "");

    handleChange({
      target: {
        name,
        value: cleanValue === "" ? "" : parseInt(cleanValue, 10),
        type: "number",
      },
    });
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    handleChange({
      target: {
        name,
        value: value === "" ? "" : parseFloat(value),
        type: "number",
      },
    });
  };

  // 4. Función que se ejecuta cuando el modal guarda con éxito
  const handlePersonSaved = () => {
    setIsModalOpen(false);
    if (onRefreshProviders) {
      onRefreshProviders(); // Llama al padre para que actualice el <select>
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fade-in">
      {/* ======================================================== */}
      {/* VISTA 1: SI ES UN VEHÍCULO PROPIO (Formulario tradicional) */}
      {/* ======================================================== */}
      {!isConsignado && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 flex items-center gap-2">
            <FiDollarSign className="text-green-600" /> Valores Comerciales del
            Vehículo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio de Compra (Costo) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiDollarSign className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="purchase_price"
                  value={
                    formData.purchase_price
                      ? formatMoney(formData.purchase_price, false)
                      : ""
                  }
                  onChange={handleMoneyInputChange}
                  placeholder="0"
                  className={`block w-full pl-10 pr-3 py-2.5 border ${errors.purchase_price ? "border-red-300" : "border-gray-300"} rounded-lg shadow-sm focus:ring-blue-500`}
                />
              </div>
              {errors.purchase_price && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.purchase_price}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Margen Estimado (%)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiPercent className="text-gray-400" />
                </div>
                <input
                  type="number"
                  name="profit_margin"
                  value={formData.profit_margin}
                  onChange={handleNumberChange}
                  placeholder="25"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio de Venta Sugerido *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiTrendingUp className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="sale_price"
                  value={
                    formData.sale_price
                      ? formatMoney(formData.sale_price, false)
                      : ""
                  }
                  onChange={handleMoneyInputChange}
                  placeholder="0"
                  className={`block w-full pl-10 pr-3 py-2.5 border ${errors.sale_price ? "border-red-300" : "border-gray-300"} rounded-lg shadow-sm focus:ring-blue-500`}
                />
              </div>
              {errors.sale_price && (
                <p className="mt-1 text-sm text-red-600">{errors.sale_price}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VISTA 2: SI ES CONSIGNACIÓN (Sección de Contrato Primero) */}
      {/* ======================================================== */}
      {isConsignado && (
        <div className="space-y-8">
          {/* Condiciones del Contrato */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 flex items-center gap-2">
              <FiBriefcase className="text-blue-600" /> Condiciones del Contrato
              de Consignación
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proveedor / Propietario *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="text-gray-400" />
                  </div>
                  <select
                    name="id_proveedor"
                    value={formData.id_proveedor}
                    onChange={handleNumberChange}
                    className={`block w-full pl-10 pr-3 py-2.5 border ${errors.id_proveedor ? "border-red-300" : "border-gray-300"} rounded-lg bg-white shadow-sm focus:ring-blue-500`}
                  >
                    <option value="">Seleccione un proveedor...</option>
                    {mockProveedores.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre || p.nombre_completo} ({p.rut})
                      </option>
                    ))}
                  </select>
                  <div>
                    {/* 5. Cambiamos el onClick para abrir el modal */}
                    <button
                      type="button"
                      className="mt-2 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 py-1.5 px-4 rounded-lg shadow-sm focus:ring-blue-500 transition-colors text-sm font-medium"
                      onClick={() => setIsModalOpen(true)}
                    >
                      + Agregar Nuevo Proveedor
                    </button>
                  </div>
                </div>
                {errors.id_proveedor && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.id_proveedor}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio Mínimo a Recibir por el Dueño *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiDollarSign className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="precio_esperado"
                    value={
                      formData.precio_esperado
                        ? formatMoney(formData.precio_esperado, false)
                        : ""
                    }
                    onChange={handleMoneyInputChange}
                    className={`block w-full pl-10 pr-3 py-2.5 border ${errors.precio_esperado ? "border-red-300" : "border-gray-300"} rounded-lg shadow-sm focus:ring-blue-500`}
                  />
                </div>
                {errors.precio_esperado && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.precio_esperado}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio Mínimo de Oferta en Vitrina
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiTrendingDown className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="precio_minimo"
                    value={
                      formData.precio_minimo
                        ? formatMoney(formData.precio_minimo, false)
                        : ""
                    }
                    onChange={handleMoneyInputChange}
                    placeholder="Igual al esperado si se deja vacío"
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duración del Contrato (Días)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiCalendar className="text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="duracion"
                    value={formData.duracion}
                    onChange={handleNumberChange}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rebaja Máxima Comercial Autorizada ($)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiTrendingDown className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="rebaja_maxima_permitida"
                    value={
                      formData.rebaja_maxima_permitida
                        ? formatMoney(formData.rebaja_maxima_permitida, false)
                        : ""
                    }
                    onChange={handleMoneyInputChange}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Porcentaje de Comisión (%)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiPercent className="text-gray-400" />
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    name="porcentaje_comision"
                    value={formData.porcentaje_comision}
                    onChange={handleNumberChange}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comisión Mínima Piso ($)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiDollarSign className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="comision_minima"
                    value={
                      formData.comision_minima
                        ? formatMoney(formData.comision_minima, false)
                        : ""
                    }
                    onChange={handleMoneyInputChange}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gastos Operacionales Iniciales ($)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiBriefcase className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="gastos_administrativos"
                    value={
                      formData.gastos_administrativos
                        ? formatMoney(formData.gastos_administrativos, false)
                        : ""
                    }
                    onChange={handleMoneyInputChange}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Penalización por Retiro Anticipado de Vitrina ($)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiAlertTriangle className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="multa_retiro_anticipado"
                    value={
                      formData.multa_retiro_anticipado
                        ? formatMoney(formData.multa_retiro_anticipado, false)
                        : ""
                    }
                    onChange={handleMoneyInputChange}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* LA SECCIÓN VALORES COMERCIALES AHORA SE MUESTRA ABAJO EN CONSIGNACIÓN */}
          <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 flex items-center gap-2">
              <FiDollarSign className="text-green-600" /> Valores Comerciales
              (Vehículo Consignado)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Bloqueado o sincronizado automáticamente con el precio_esperado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio de Liquidación (Costo) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiDollarSign className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="purchase_price"
                    value={
                      formData.purchase_price
                        ? formatMoney(formData.purchase_price, false)
                        : ""
                    }
                    onChange={handleMoneyInputChange}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 font-medium text-gray-600 shadow-sm focus:ring-blue-500"
                    placeholder="Sincronizado"
                  />
                </div>
                <p className="mt-1 text-xs text-blue-600 font-medium flex items-center gap-1">
                  <FiTrendingDown /> Sincronizado dinámicamente con los precios
                  acordados arriba.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Margen Estimado (%)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiPercent className="text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="profit_margin"
                    value={formData.profit_margin}
                    onChange={handleNumberChange}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio de Venta Sugerido en Vitrina *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiTrendingUp className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="sale_price"
                    value={
                      formData.sale_price
                        ? formatMoney(formData.sale_price, false)
                        : ""
                    }
                    onChange={handleMoneyInputChange}
                    className={`block w-full pl-10 pr-3 py-2.5 border ${errors.sale_price ? "border-red-300" : "border-gray-300"} rounded-lg shadow-sm focus:ring-blue-500`}
                  />
                </div>
                {errors.sale_price && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.sale_price}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Checklist de Documentos */}
          <div className="mt-8 bg-gray-50 p-5 rounded-xl border border-gray-200">
            <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
              <FiCheckSquare className="text-blue-500" /> Checklist de Recepción
              de Documentos y Accesorios
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Object.keys(formData.checklist).map((key) => {
                const labelMap = {
                  p_circulacion: "Permiso de Circulación",
                  insc_reg_civil: "Inscripción Reg. Civil",
                  seguro_obligatorio: "Seguro Obligatorio (SOAP)",
                  triangulos: "Triángulos de Emergencia",
                  gata_llave: "Gata y Llave de Rueda",
                  repuesto: "Rueda de Repuesto",
                  rev_tecnica: "Revisión Técnica al Día",
                  extintor: "Extintor de Incendios",
                  copia_llave: "Segunda Copia de Llave",
                  manual: "Manual de Usuario",
                  cert_anotaciones: "Cert. Anotaciones",
                  transf_firmada: "Transferencia Firmada"
                };
                return (
                  <label
                    key={key}
                    className="flex items-center space-x-3 bg-white p-3 rounded-lg border shadow-sm cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <input
                      type="checkbox"
                      name={`chk_${key}`}
                      checked={formData.checklist[key]}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600 font-medium">
                      {labelMap[key] || key}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 6. Renderizamos el Modal al final del componente */}
      <PersonFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={handlePersonSaved}
      />
    </div>
  );
};

export default Step3Financial;


