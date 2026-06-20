// src/components/vehicles/VehicleForm.jsx
import React, { useState, useEffect } from "react";
import vehicleService from "../../services/vehicleService";
import lotService from "../../services/lotService";
import { useNavigate, useParams } from "react-router-dom";
import { formatMoney } from "../../utils/formatters";
import { Loading } from '../ui/Loading';
import { toast } from "react-hot-toast";
import { 
  FiTruck, FiTag, FiDollarSign, FiImage, FiSave, FiX, 
  FiMapPin, FiPackage, FiInfo, FiCalendar, FiChevronDown,
  FiFileText, FiPercent
} from 'react-icons/fi';

// DICCIONARIO DE DATOS (Marcas y Modelos) - SIN CAMBIOS
const CAR_BRANDS = {
  Toyota: ["Yaris", "Corolla", "Hilux", "RAV4", "4Runner"],
  Chevrolet: ["Sail", "Spark", "Onix", "Silverado", "Tracker"],
  Hyundai: ["Accent", "Elantra", "Tucson", "Santa Fe", "Grand i10"],
  Kia: ["Morning", "Rio 5", "Soluto", "Sportage", "Sorento"],
  Nissan: ["Versa", "Sentra", "Qashqai", "X-Trail", "Navara"],
  Suzuki: ["Swift", "Baleno", "Alto", "Dzire", "Jimny"],
  Ford: ["Ranger", "F-150", "Explorer", "Territory"],
  Mazda: ["Mazda 3", "Mazda 6", "CX-5", "CX-30", "BT-50"],
};

// ========== ICONOS SVG INLINE - REEMPLAZADO POR REACT-ICONS ==========
const Icon = ({ name, className = "w-5 h-5" }) => {
  const icons = {
    car: <FiTruck className={className} />,
    tag: <FiTag className={className} />,
    dollar: <FiDollarSign className={className} />,
    image: <FiImage className={className} />,
    save: <FiSave className={className} />,
    cancel: <FiX className={className} />,
    map: <FiMapPin className={className} />,
    palette: <FiPackage className={className} />,
    info: <FiInfo className={className} />,
  };
  return icons[name] || null;
};

// ========== BADGE DE ESTADO - SIN CAMBIOS ==========
const StatusBadge = ({ status }) => {
  const colors = {
    available: "bg-green-100 text-green-800 border-green-200",
    reserved: "bg-yellow-100 text-yellow-800 border-yellow-200",
    sold: "bg-gray-100 text-gray-800 border-gray-200",
    maintenance: "bg-red-100 text-red-800 border-red-200",
  };

  const labels = {
    available: "Disponible",
    reserved: "Reservado",
    sold: "Vendido",
    maintenance: "En Mantenimiento",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${colors[status] || colors.available}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
      {labels[status] || "Disponible"}
    </span>
  );
};

// ========== COMPONENTE PRINCIPAL VEHICLEFORM - SIN CAMBIOS EN LÓGICA ==========
const VehicleForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState({ page: false, submit: false });
  const [errors, setErrors] = useState({});

  // Estado para el Margen de Ganancia (%)
  const [profitMargin, setProfitMargin] = useState(25);

  // Estado del Formulario
  const [formData, setFormData] = useState({
    lot_id: "",
    make: "",
    model: "",
    color: "",
    year: new Date().getFullYear(),
    vin: "",
    plate: "",
    purchase_price: "",
    sale_price: "",
    entry_date: new Date().toLocaleDateString("en-CA"),
    status: "available",
    photo: null,
  });

  // ========== CARGA DE DATOS - SIN CAMBIOS ==========
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading((prev) => ({ ...prev, page: true }));

        // ✅ Cargar lotes: API devuelve { data: [...] }
        const lotsResponse = await lotService.getAll();
        if (lotsResponse && lotsResponse.data) {
          setLots(lotsResponse.data);
        } else {
          setLots(lotsResponse || []);
        }

        // ✅ Cargar vehículo si es edición: API devuelve objeto directo
        if (isEditMode) {
          const vehicle = await vehicleService.getById(id);

          if (vehicle.entry_date) {
            vehicle.entry_date = vehicle.entry_date.split(" ")[0];
          }
          setFormData((prev) => ({
            ...prev,
            ...vehicle,
            color: vehicle.color || "",
          }));

          // Calcular margen inicial
          if (
            vehicle.purchase_price &&
            vehicle.sale_price &&
            vehicle.purchase_price > 0
          ) {
            const margin =
              ((vehicle.sale_price - vehicle.purchase_price) /
                vehicle.purchase_price) *
              100;
            setProfitMargin(Math.round(margin));
          }
        }
      } catch (err) {
        console.error(err);
        toast.error(err.message || "Error al cargar datos");
      } finally {
        setLoading((prev) => ({ ...prev, page: false }));
      }
    };
    loadData();
  }, [id, isEditMode]);

  // ========== VALIDACIÓN - SIN CAMBIOS ==========
  const validateForm = () => {
    const newErrors = {};

    // Validación de campos requeridos
    if (!formData.lot_id) newErrors.lot_id = "Selecciona un lote";
    if (!formData.make) newErrors.make = "Selecciona una marca";
    if (!formData.model) newErrors.model = "Selecciona un modelo";
    if (!formData.year || formData.year < 1900 || formData.year > 2100)
      newErrors.year = "Año inválido";

    // Validación de precios
    const purchasePrice = parseFloat(formData.purchase_price) || 0;
    const salePrice = parseFloat(formData.sale_price) || 0;

    if (purchasePrice <= 0)
      newErrors.purchase_price = "Precio de compra inválido";
    if (salePrice <= 0) newErrors.sale_price = "Precio de venta inválido";
    if (salePrice <= purchasePrice)
      newErrors.sale_price = "Venta debe ser mayor a compra";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ========== HANDLERS - SIN CAMBIOS ==========
  const handleBrandChange = (e) => {
    const newMake = e.target.value;
    setFormData((prev) => ({
      ...prev,
      make: newMake,
      model: "", // Reset model
    }));
  };

  const calculateSalePrice = (cost, margin) => {
    const pPrice = parseFloat(cost) || 0;
    const marginDecimal = parseFloat(margin) / 100;
    return pPrice + pPrice * marginDecimal;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "plate") {
      setFormData((prev) => ({ ...prev, [name]: value.toUpperCase() }));
    } else if (name === "purchase_price") {
      const numericValue = parseFloat(value) || 0;
      const newSalePrice = calculateSalePrice(numericValue, profitMargin);
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        sale_price: newSalePrice,
      }));
    } else if (name === "sale_price") {
      // Si cambia venta manualmente, recalcular margen
      setFormData((prev) => ({ ...prev, [name]: value }));
      const purchasePrice = parseFloat(formData.purchase_price) || 0;
      const salePrice = parseFloat(value) || 0;
      if (purchasePrice > 0 && salePrice > purchasePrice) {
        const newMargin = ((salePrice - purchasePrice) / purchasePrice) * 100;
        setProfitMargin(Math.round(newMargin));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Limpiar error del campo
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleMarginChange = (e) => {
    const newMargin = e.target.value;
    setProfitMargin(newMargin);
    const newSalePrice = calculateSalePrice(formData.purchase_price, newMargin);
    setFormData((prev) => ({ ...prev, sale_price: newSalePrice }));
  };

  // ========== SUBMIT - REEMPLAZADO showNotification por toast ==========
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Por favor corrige los errores del formulario");
      return;
    }

    setLoading((prev) => ({ ...prev, submit: true }));
    try {
      if (isEditMode) {
        await vehicleService.update(id, formData);
        toast.success("Vehículo actualizado correctamente");
      } else {
        await vehicleService.create(formData);
        toast.success("Vehículo registrado correctamente");
      }
      setTimeout(() => navigate("/vehicles"), 1500);
    } catch (err) {
      console.error(err);
      setErrors({
        submit: err.response?.data?.error || "Error al guardar el vehículo",
      });
      toast.error(err.message || "Error al guardar");
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  // Cargar modelos según marca
  const availableModels = formData.make ? CAR_BRANDS[formData.make] || [] : [];

  // ========== RENDER - CON COMPONENTE LOADING ACTUALIZADO ==========
  if (loading.page) {
    return (
      <div >
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Icon name="car" className="w-7 h-7 text-white" />
                {isEditMode ? "Editar Vehículo" : "Registrar Vehículo"}
              </h1>
              <p className="text-blue-100 mt-1">
                {isEditMode
                  ? `Actualizando información de ${formData.make || ""} ${formData.model || ""}`
                  : "Añade un nuevo vehículo a tu inventario"}
              </p>
            </div>
            {isEditMode && (
              <StatusBadge status={formData.status || "available"} />
            )}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-b-2xl shadow-xl border border-gray-200 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 lg:p-8 space-y-8">
            {/* ========== SECCIÓN 1: UBICACIÓN Y FECHA ========== */}
            <div className="group">
              <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-2">
                <Icon name="map" className="w-5 h-5 text-gray-700" />
                <h2 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                  Ubicación y Fecha
                </h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Lote */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lote / Sucursal *
                  </label>
                  <div className="relative">
                    <select
                      name="lot_id"
                      value={formData.lot_id || ""}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-4 py-3 border-2 rounded-lg appearance-none transition-all
                        ${errors.lot_id ? "border-red-500 focus:ring-2 focus:ring-red-500" : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"}
                        bg-white hover:border-gray-400`}
                      disabled={lots.length === 0}
                    >
                      <option value="">Selecciona un lote...</option>
                      {lots.map((lot) => (
                        <option key={lot.id} value={lot.id}>
                          {lot.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute left-3 top-3.5 pointer-events-none">
                      <Icon name="map" className={`w-5 h-5 ${errors.lot_id ? "text-red-500" : "text-gray-400"}`} />
                    </div>
                    <div className="absolute right-3 top-3.5 pointer-events-none">
                      <FiChevronDown className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  {errors.lot_id && (
                    <p className="mt-1 text-xs text-red-500 font-medium">
                      {errors.lot_id}
                    </p>
                  )}
                  {lots.length === 0 && (
                    <p className="mt-1 text-xs text-orange-500">
                      Cargando lotes...
                    </p>
                  )}
                </div>

                {/* Fecha */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Ingreso *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="entry_date"
                      value={formData.entry_date || ""}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-4 py-3 border-2 rounded-lg transition-all
                        ${errors.entry_date ? "border-red-500 focus:ring-2 focus:ring-red-500" : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"}`}
                    />
                    <div className="absolute left-3 top-3.5 pointer-events-none">
                      <FiCalendar className={`w-5 h-5 ${errors.entry_date ? "text-red-500" : "text-gray-400"}`} />
                    </div>
                  </div>
                  {errors.entry_date && (
                    <p className="mt-1 text-xs text-red-500 font-medium">
                      {errors.entry_date}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ========== SECCIÓN 2: DATOS DEL VEHÍCULO ========== */}
            <div className="group">
              <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-2">
                <Icon name="car" className="w-5 h-5 text-gray-700" />
                <h2 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                  Datos del Vehículo
                </h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Marca */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marca *
                  </label>
                  <div className="relative">
                    <select
                      name="make"
                      value={formData.make || ""}
                      onChange={handleBrandChange}
                      className={`block w-full pl-10 pr-4 py-3 border-2 rounded-lg appearance-none transition-all
                        ${errors.make ? "border-red-500 focus:ring-2 focus:ring-red-500" : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"}
                        bg-white hover:border-gray-400`}
                    >
                      <option value="">Selecciona marca...</option>
                      {Object.keys(CAR_BRANDS).map((brand) => (
                        <option key={brand} value={brand}>
                          {brand}
                        </option>
                      ))}
                    </select>
                    <div className="absolute left-3 top-3.5 pointer-events-none">
                      <FiFileText className={`w-5 h-5 ${errors.make ? "text-red-500" : "text-gray-400"}`} />
                    </div>
                    <div className="absolute right-3 top-3.5 pointer-events-none">
                      <FiChevronDown className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  {errors.make && (
                    <p className="mt-1 text-xs text-red-500 font-medium">
                      {errors.make}
                    </p>
                  )}
                </div>

                {/* Modelo */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modelo *
                  </label>
                  <div className="relative">
                    <select
                      name="model"
                      value={formData.model || ""}
                      onChange={handleChange}
                      disabled={!formData.make}
                      className={`block w-full pl-10 pr-4 py-3 border-2 rounded-lg appearance-none transition-all
                        ${errors.model ? "border-red-500 focus:ring-2 focus:ring-red-500" : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"}
                        ${formData.make ? "bg-white hover:border-gray-400" : "bg-gray-100 cursor-not-allowed"}`}
                    >
                      <option value="">
                        {formData.make
                          ? "Selecciona modelo..."
                          : "Primero selecciona una marca"}
                      </option>
                      {availableModels.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                    <div className="absolute left-3 top-3.5 pointer-events-none">
                      <FiFileText className={`w-5 h-5 ${errors.model ? "text-red-500" : "text-gray-400"}`} />
                    </div>
                    <div className="absolute right-3 top-3.5 pointer-events-none">
                      <FiChevronDown className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  {errors.model && (
                    <p className="mt-1 text-xs text-red-500 font-medium">
                      {errors.model}
                    </p>
                  )}
                </div>

                {/* Año */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Año *
                  </label>
                  <input
                    type="number"
                    name="year"
                    required
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    value={formData.year || ""}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-4 py-3 border-2 rounded-lg transition-all
                      ${errors.year ? "border-red-500 focus:ring-2 focus:ring-red-500" : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"}`}
                  />
                  <div className="absolute left-3 top-3.5 pointer-events-none">
                    <FiCalendar className={`w-5 h-5 ${errors.year ? "text-red-500" : "text-gray-400"}`} />
                  </div>
                  {errors.year && (
                    <p className="mt-1 text-xs text-red-500 font-medium">
                      {errors.year}
                    </p>
                  )}
                </div>

                {/* Patente */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patente
                  </label>
                  <input
                    type="text"
                    name="plate"
                    placeholder="ABCD12"
                    maxLength="6"
                    value={formData.plate || ""}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200 uppercase font-bold tracking-wider"
                  />
                  <div className="absolute left-3 top-3.5 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l3-3m0 0l-3-3m3 3V4m11 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>

                {/* VIN */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    VIN / Chasis
                  </label>
                  <input
                    type="text"
                    name="vin"
                    value={formData.vin || ""}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-mono text-sm"
                  />
                  <div className="absolute left-3 top-3.5 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>

                {/* Color */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <input
                    type="text"
                    name="color"
                    placeholder="Ej: Blanco Perla"
                    value={formData.color || ""}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                  <div className="absolute left-3 top-3.5 pointer-events-none">
                    <Icon name="palette" className="w-5 h-5 text-gray-400" />
                  </div>
                </div>

                {/* Estado (solo en edición) */}
                {isEditMode && (
                  <div className="lg:col-span-2 relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado del Vehículo
                    </label>
                    <div className="relative">
                      <select
                        name="status"
                        value={formData.status || ""}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-4 py-3 border-2 rounded-lg appearance-none transition-all
                          ${errors.status ? "border-red-500 focus:ring-2 focus:ring-red-500" : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"}
                          bg-white hover:border-gray-400`}
                      >
                        <option value="available">Disponible</option>
                        <option value="reserved">Reservado</option>
                        <option value="sold">Vendido</option>
                        <option value="maintenance">En Mantenimiento</option>
                      </select>
                      <div className="absolute left-3 top-3.5 pointer-events-none">
                        <Icon name="info" className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="absolute right-3 top-3.5 pointer-events-none">
                        <FiChevronDown className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ========== SECCIÓN 3: PRECIOS ========== */}
            <div className="group">
              <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-2">
                <Icon name="dollar" className="w-5 h-5 text-gray-700" />
                <h2 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                  Gestión Financiera
                </h2>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Precio Compra */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Costo Compra ($)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="purchase_price"
                        placeholder="0"
                        value={formData.purchase_price || ""}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-4 py-3 border-2 rounded-lg transition-all
                          ${errors.purchase_price ? "border-red-500 focus:ring-2 focus:ring-red-500" : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"}
                          font-semibold hover:border-gray-400`}
                      />
                      <div className="absolute left-3 top-3.5 pointer-events-none">
                        <span className="text-gray-400 font-bold">$</span>
                      </div>
                    </div>
                    {errors.purchase_price && (
                      <p className="mt-1 text-xs text-red-500 font-medium">
                        {errors.purchase_price}
                      </p>
                    )}
                  </div>

                  {/* Margen */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Margen de Ganancia (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="999"
                        value={profitMargin}
                        onChange={handleMarginChange}
                        className="block w-full pl-4 pr-12 py-3 border-2 border-gray-300 rounded-lg transition-all focus:border-green-500 focus:ring-2 focus:ring-green-200 font-semibold text-center hover:border-gray-400"
                      />
                      <div className="absolute right-3 top-3.5">
                        <span className="text-gray-500 font-bold">%</span>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Sobre el costo de compra
                    </p>
                  </div>

                  {/* Precio Venta */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Precio Venta Sugerido ($)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="sale_price"
                        placeholder="Calculado automáticamente"
                        value={formData.sale_price || ""}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-4 py-3 border-2 rounded-lg transition-all
                          border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200
                          font-bold text-green-700 hover:border-gray-400 bg-white"
                      />
                      <div className="absolute left-3 top-3.5 pointer-events-none">
                        <span className="text-green-600 font-bold">$</span>
                      </div>
                    </div>
                    {errors.sale_price && (
                      <p className="mt-1 text-xs text-red-500 font-medium">
                        {errors.sale_price}
                      </p>
                    )}
                  </div>
                </div>

                {/* Ganancia estimada */}
                {formData.purchase_price > 0 && formData.sale_price > 0 && (
                  <div className="mt-4 p-3 bg-white rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Ganancia real:
                      </span>
                      <span className="font-bold text-green-700">
                        {formatMoney(
                          formData.sale_price - formData.purchase_price,
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">
                        Margen de rentabilidad:
                      </span>
                      <span className="text-xs font-semibold text-green-600">
                        {/* Usamos Math.max para evitar porcentajes negativos y validamos división por cero */}
                        {formData.sale_price > 0
                          ? Math.max(
                              0,
                              ((formData.sale_price - formData.purchase_price) /
                                formData.sale_price) *
                                100,
                            ).toFixed(1)
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ========== BOTONES ========== */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate("/vehicles")}
                disabled={loading.submit}
                className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon name="cancel" className="w-5 h-5" />
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading.submit || loading.page}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
              >
                {loading.submit ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg "
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Icon name="save" className="w-5 h-5 text-white" />
                    {isEditMode ? "Guardar Cambios" : "Registrar Vehículo"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VehicleForm;