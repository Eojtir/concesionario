import React, { useState, useEffect } from "react";
import vehicleService from "../services/vehicleService";
import lotService from "../services/lotService"; // Asegúrate de tener este servicio
import { useNavigate, useParams } from "react-router-dom";

// DICCIONARIO DE DATOS (Marcas y Modelos)
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

const VehicleForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Capturamos el ID si viene en la URL
  const isEditMode = !!id; // True si estamos editando, False si es nuevo

  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [availableModels, setAvailableModels] = useState([]);

  // Estado para el Margen de Ganancia (%)
  const [profitMargin, setProfitMargin] = useState(20);

  // Estado del Formulario
  const [formData, setFormData] = useState({
    lot_id: "",
    make: "",
    model: "",
    color: "", // <--- NUEVO CAMPO
    year: new Date().getFullYear(),
    vin: "",
    plate: "",
    purchase_price: "",
    sale_price: "",
    entry_date: new Date().toISOString().split("T")[0],
    status: "available",
  });

  // ============================================================
  // EFECTO PRINCIPAL: CARGA DE DATOS
  // ============================================================
  useEffect(() => {
    // 1. Cargar Lotes (SIEMPRE, sea nuevo o editar)
    const fetchLots = async () => {
      try {
        const lotsData = await lotService.getAll();
        setLots(lotsData);
      } catch (err) {
        console.error("Error cargando lotes:", err);
        // No bloqueamos la app, pero mostramos en consola
      }
    };
    fetchLots();

    // 2. Cargar Vehículo (SOLO si es edición)
    if (isEditMode) {
      const fetchVehicle = async () => {
        try {
          setLoading(true);
          const data = await vehicleService.getById(id);

          // Limpiar fecha (quitar hora si viene de MySQL)
          if (data.entry_date) {
            data.entry_date = data.entry_date.split(" ")[0];
          }

          // Asegurar que no haya nulos para evitar warnings de React
          setFormData({
            ...data,
            color: data.color || "", // Protección contra null
            lot_id: data.lot_id || "",
          });

          // Calcular el margen actual basado en los precios guardados
          if (data.purchase_price && data.sale_price && data.purchase_price > 0) {
            const margin =
              ((data.sale_price - data.purchase_price) / data.purchase_price) * 100;
            setProfitMargin(Math.round(margin));
          }

          // Cargar modelos correspondientes a la marca guardada
          if (data.make && CAR_BRANDS[data.make]) {
            setAvailableModels(CAR_BRANDS[data.make]);
          }
        } catch (err) {
          console.error(err);
          setError("No se pudo cargar la información del vehículo.");
        } finally {
          setLoading(false);
        }
      };
      fetchVehicle();
    }
  }, [id, isEditMode]);

  // ============================================================
  // MANEJADORES DE EVENTOS
  // ============================================================

  // Cambio de Marca (Resetea modelo)
  const handleBrandChange = (e) => {
    const newMake = e.target.value;
    setFormData((prev) => ({
      ...prev,
      make: newMake,
      model: "", // Resetear modelo
    }));

    if (newMake && CAR_BRANDS[newMake]) {
      setAvailableModels(CAR_BRANDS[newMake]);
    } else {
      setAvailableModels([]);
    }
  };

  // Calcular Precio Venta Sugerido
  const calculateSalePrice = (cost, margin) => {
    const pPrice = parseFloat(cost) || 0;
    const marginDecimal = parseFloat(margin) / 100;
    const suggestedSale = pPrice + pPrice * marginDecimal;
    return suggestedSale > 0 ? Math.round(suggestedSale) : "";
  };

  // Inputs Generales
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Si cambia el precio de compra, recalculamos venta
    if (name === "purchase_price") {
      const newSalePrice = calculateSalePrice(value, profitMargin);
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        sale_price: newSalePrice,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        // Patente siempre mayúscula, el resto normal
        [name]: name === "plate" ? value.toUpperCase() : value,
      }));
    }
  };

  // Cambio de Margen
  const handleMarginChange = (e) => {
    const newMargin = e.target.value;
    setProfitMargin(newMargin);
    const newSalePrice = calculateSalePrice(formData.purchase_price, newMargin);
    setFormData((prev) => ({ ...prev, sale_price: newSalePrice }));
  };

  // Enviar Formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isEditMode) {
        await vehicleService.update(id, formData);
      } else {
        await vehicleService.create(formData);
      }
      navigate("/dashboard"); // O donde listes tus autos
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Error al guardar el vehículo");
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode && !formData.make)
    return <div className="text-center p-10">Cargando datos...</div>;

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded shadow mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
        {isEditMode ? "Editar Vehículo" : "Registrar Nuevo Vehículo"}
      </h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm font-bold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECCIÓN 1: UBICACIÓN Y FECHA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded border border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700">Lote / Sucursal *</label>
            <select
              name="lot_id"
              required
              value={formData.lot_id || ""}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded p-2 bg-white focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seleccione Lote...</option>
              {lots.map((lot) => (
                <option key={lot.id} value={lot.id}>
                  {lot.name}
                </option>
              ))}
            </select>
            {lots.length === 0 && (
              <p className="text-xs text-orange-500 mt-1">Cargando lotes...</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha de Ingreso</label>
            <input
              type="date"
              name="entry_date"
              required
              value={formData.entry_date || ""}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded p-2"
            />
          </div>
        </div>

        {/* SECCIÓN 2: DATOS DEL AUTO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Marca */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Marca</label>
            <select
              name="make"
              value={formData.make || ""}
              onChange={handleBrandChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded p-2 bg-white"
            >
              <option value="">Seleccione Marca...</option>
              {Object.keys(CAR_BRANDS).map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          {/* Modelo */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Modelo</label>
            <select
              name="model"
              value={formData.model || ""}
              onChange={handleChange}
              required
              disabled={!formData.make}
              className="mt-1 block w-full border border-gray-300 rounded p-2 bg-white disabled:bg-gray-100"
            >
              <option value="">Seleccione Modelo...</option>
              {availableModels.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* DETALLES ESPECÍFICOS (GRID 2x2) */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
          
          {/* Patente */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Patente</label>
            <input
              type="text"
              name="plate"
              placeholder="ABCD12"
              maxLength="6"
              value={formData.plate || ""}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded p-2 uppercase tracking-wider font-bold"
            />
          </div>

          {/* Año */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Año</label>
            <input
              type="number"
              name="year"
              required
              value={formData.year || ""}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded p-2"
            />
          </div>

          {/* VIN */}
          <div>
            <label className="block text-sm font-medium text-gray-700">VIN / Chasis</label>
            <input
              type="text"
              name="vin"
              value={formData.vin || ""}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded p-2"
            />
          </div>

          {/* Color (NUEVO) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Color</label>
            <input
              type="text"
              name="color"
              placeholder="Ej: Blanco"
              value={formData.color || ""}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded p-2"
            />
          </div>
        </div>

        {/* ESTADO (Solo visible al editar) */}
        {isEditMode && (
          <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
            <label className="block text-sm font-medium text-yellow-800 mb-1">
              Estado Actual
            </label>
            <select
              name="status"
              value={formData.status || ""}
              onChange={handleChange}
              className="block w-full border border-yellow-400 rounded p-2 bg-white"
            >
              <option value="available">Disponible</option>
              <option value="reserved">Reservado</option>
              <option value="sold">Vendido</option>
              <option value="maintenance">Mantenimiento</option>
            </select>
          </div>
        )}

        {/* SECCIÓN 3: PRECIOS */}
        <div className="bg-blue-50 p-4 rounded border border-blue-100">
          <h4 className="text-sm font-bold text-blue-800 mb-2 border-b border-blue-200 pb-1">
            Gestión Financiera
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Precio Compra */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Costo Compra ($)</label>
              <input
                type="number"
                name="purchase_price"
                value={formData.purchase_price || ""}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded p-2"
              />
            </div>

            {/* Margen */}
            <div>
              <label className="block text-sm font-medium text-gray-700">% Margen</label>
              <div className="relative mt-1">
                <input
                  type="number"
                  value={profitMargin}
                  onChange={handleMarginChange}
                  className="block w-full border border-blue-300 rounded p-2 pr-8 text-center"
                />
                <span className="absolute right-3 top-2 text-gray-500">%</span>
              </div>
            </div>

            {/* Precio Venta */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Venta Sugerido ($)</label>
              <input
                type="number"
                name="sale_price"
                value={formData.sale_price || ""}
                onChange={handleChange}
                className="mt-1 block w-full border border-green-300 rounded p-2 font-bold text-green-700 bg-green-50"
              />
            </div>
          </div>
        </div>

        {/* BOTONES */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="px-5 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 shadow-md transition-colors"
          >
            {loading ? "Guardando..." : isEditMode ? "Guardar Cambios" : "Registrar Vehículo"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VehicleForm;