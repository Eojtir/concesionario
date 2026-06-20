import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

// Servicios
import personService from "../../services/personService";
import vehicleService from "../../services/vehicleService";
import quoteService from "../../services/quoteService";

// Componentes UI
import { Loading } from "../ui/Loading";
import SearchableSelect from "../molecules/SearchableSelect";
import { formatMoney, cleanMoney } from "../../utils/formatters";

// Modal de cliente
import PersonFormModal from "../directory/PersonFormModal";

const QuoteForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshingClients, setIsRefreshingClients] = useState(false);

  const [clients, setClients] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Modal de nuevo cliente
  const [showClientModal, setShowClientModal] = useState(false);

  // Descuento global
  const [globalDiscount, setGlobalDiscount] = useState({
    type: "amount",
    value: "",
  });

  const [formData, setFormData] = useState({
    client_id: "",
    vehicle_id: "",
    precio_venta: "",
    precio_ofrecido: "",
    quote_date: new Date().toISOString().split("T")[0],
    valid_until: new Date(Date.now() + 7 * 86400000)
      .toISOString()
      .split("T")[0],
    notes: "",
  });

  const [items, setItems] = useState([
    {
      id: 1,
      descripcion: "",
      cantidad: 1,
      precio_unitario: "",
      descuento_porcentaje: 0,
      descuento_monto: 0,
      subtotal: 0,
    },
  ]);

  // Cargar vehicle_id desde URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const vehicleId = params.get("vehicle_id") || params.get("vehicleId");
    console.log("Parámetros de URL:", Object.fromEntries(params.entries()));

    if (vehicleId) {
      setFormData((prev) => ({ ...prev, vehicle_id: vehicleId }));
    }
  }, [location.search]);

  // Carga inicial de dependencias
  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        setIsLoading(true);
        const [clientsRes, vehiclesRes] = await Promise.all([
          personService.getAll(),
          vehicleService.getAvailable(),
        ]);

        const clientsData = clientsRes?.data || [];
        const vehiclesData = vehiclesRes?.data || vehiclesRes || [];

        const filteredClients = Array.isArray(clientsData)
          ? clientsData.filter((person) => person.es_cliente == 1)
          : [];

        setClients(filteredClients);
        setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
      } catch (err) {
        console.error("Error al cargar dependencias:", err);
        toast.error("No se pudieron cargar los clientes o vehículos.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDependencies();
  }, []);

  // Auto-completar cuando se selecciona vehículo
  useEffect(() => {
    if (formData.vehicle_id && vehicles.length > 0) {
      const selected = vehicles.find(
        (v) =>
          v.id?.toString() === formData.vehicle_id?.toString() ||
          v.vehicle_id?.toString() === formData.vehicle_id?.toString()
      );

      console.log("Buscando vehículo:", formData.vehicle_id);
      console.log(
        "Vehículos disponibles:",
        vehicles.map((v) => ({
          id: v.id,
          vehicle_id: v.vehicle_id,
          make: v.make,
        }))
      );
      console.log("Vehículo encontrado:", selected);

      setSelectedVehicle(selected || null);

      if (selected && selected.sale_price) {
        const salePrice = selected.sale_price.toString();
        setFormData((prev) => ({
          ...prev,
          precio_venta: salePrice,
          precio_ofrecido: salePrice,
        }));

        setItems((prev) => {
          const newItems = [...prev];
          newItems[0] = {
            ...newItems[0],
            descripcion:
              `${selected.make || ""} ${selected.model || ""} ${selected.year || ""}`.trim(),
            precio_unitario: salePrice,
            subtotal: parseFloat(salePrice) || 0,
          };
          return newItems;
        });
      }
    } else if (!formData.vehicle_id) {
      setSelectedVehicle(null);
      setFormData((prev) => ({
        ...prev,
        precio_venta: "",
        precio_ofrecido: "",
      }));
    }
  }, [formData.vehicle_id, vehicles]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handler para descuento global
  const handleGlobalDiscountChange = (field, value) => {
    setGlobalDiscount((prev) => ({ ...prev, [field]: value }));
  };

  // ===== ÍTEMS =====
  const addItem = () => {
    const newId =
      items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
    setItems((prev) => [
      ...prev,
      {
        id: newId,
        descripcion: "",
        cantidad: 1,
        precio_unitario: "",
        descuento_porcentaje: 0,
        descuento_monto: 0,
        subtotal: 0,
      },
    ]);
  };

  const removeItem = (id) => {
    // No permitir eliminar el ítem del vehículo (siempre es el primero)
    const itemToRemove = items.find((i) => i.id === id);
    if (itemToRemove && items.indexOf(itemToRemove) === 0) {
      toast.error("No se puede eliminar el vehículo de la cotización");
      return;
    }
    if (items.length <= 1) {
      toast.error("Debe haber al menos un ítem");
      return;
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateItem = (id, field, value) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        const updated = { ...item, [field]: value };

        if (
          [
            "cantidad",
            "precio_unitario",
            "descuento_porcentaje",
            "descuento_monto",
          ].includes(field)
        ) {
          const cant = parseInt(updated.cantidad) || 0;
          const pu = parseFloat(cleanMoney(updated.precio_unitario)) || 0;
          const descPct = parseFloat(updated.descuento_porcentaje) || 0;
          const descMonto =
            parseFloat(cleanMoney(updated.descuento_monto)) || 0;

          let subtotal = cant * pu;
          if (descPct > 0) {
            subtotal = subtotal - subtotal * (descPct / 100);
          } else if (descMonto > 0) {
            subtotal = subtotal - descMonto;
          }
          updated.subtotal = Math.max(0, subtotal);
        }

        return updated;
      })
    );
  };

  const calcularTotales = () => {
    // Total bruto = suma de todos los ítems (cantidad * precio_unitario)
    const totalBruto = items.reduce((sum, item) => {
      const cant = parseInt(item.cantidad) || 0;
      const pu = parseFloat(cleanMoney(item.precio_unitario)) || 0;
      return sum + cant * pu;
    }, 0);

    // Descuentos por ítem (ya aplicados en subtotal)
    const totalDescuentosItems = items.reduce((sum, item) => {
      const cant = parseInt(item.cantidad) || 0;
      const pu = parseFloat(cleanMoney(item.precio_unitario)) || 0;
      const descPct = parseFloat(item.descuento_porcentaje) || 0;
      const descMonto = parseFloat(cleanMoney(item.descuento_monto)) || 0;

      let desc = 0;
      if (descPct > 0) desc = cant * pu * (descPct / 100);
      else if (descMonto > 0) desc = descMonto;
      return sum + desc;
    }, 0);

    // Total ítems (después de descuentos por ítem)
    const totalItems = items.reduce(
      (sum, item) => sum + (parseFloat(item.subtotal) || 0),
      0
    );

    // Descuento GLOBAL
    const globalValue = parseFloat(cleanMoney(globalDiscount.value)) || 0;
    let descuentoGlobal = 0;
    if (globalDiscount.type === "percentage" && globalValue > 0) {
      descuentoGlobal = totalItems * (globalValue / 100);
    } else if (globalDiscount.type === "amount" && globalValue > 0) {
      descuentoGlobal = globalValue;
    }

    // Precio ofrecido final
    const precioOfrecido = Math.max(0, totalItems - descuentoGlobal);

    return {
      totalBruto,
      totalDescuentosItems,
      totalItems,
      descuentoGlobal,
      precioOfrecido,
    };
  };

  const { totalBruto, totalDescuentosItems, totalItems, descuentoGlobal, precioOfrecido } = calcularTotales();

  const validate = () => {
    if (!formData.client_id) return "Debe seleccionar un cliente";
    if (!formData.vehicle_id) return "Debe seleccionar un vehículo";

    for (const item of items) {
      if (!item.descripcion.trim())
        return "Todos los ítems deben tener descripción";
      if (
        !item.precio_unitario ||
        parseFloat(cleanMoney(item.precio_unitario)) <= 0
      )
        return "Todos los ítems deben tener precio unitario";
    }

    if (precioOfrecido <= 0) {
      return "El precio ofrecido debe ser mayor a 0";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        client_id: parseInt(formData.client_id),
        vehicle_id: parseInt(formData.vehicle_id),
        price: precioOfrecido,
        quote_date: formData.quote_date,
        valid_until: formData.valid_until,
        notes: formData.notes,
        status: "pending",
        items: items.map((item) => ({
          descripcion: item.descripcion,
          cantidad: parseInt(item.cantidad) || 1,
          precio_unitario: parseFloat(cleanMoney(item.precio_unitario)) || 0,
          descuento_porcentaje: parseFloat(item.descuento_porcentaje) || 0,
          descuento_monto: parseFloat(cleanMoney(item.descuento_monto)) || 0,
          subtotal: parseFloat(item.subtotal) || 0,
        })),
        global_discount: {
          type: globalDiscount.type,
          value: parseFloat(cleanMoney(globalDiscount.value)) || 0,
        },
      };

      const res = await quoteService.createWithPdf(payload);

      if (res.status === "success" && res.data?.url_descarga) {
        toast.success(`Cotización #${res.data.quote_number} creada exitosamente`);

        const pdfUrl = res.data.url_descarga.startsWith("http")
          ? res.data.url_descarga
          : `${import.meta.env.VITE_API_URL || "https://clientes.inverprado.com"}${res.data.url_descarga}`;

        const nuevaVentana = window.open(pdfUrl, "_blank");

        if (!nuevaVentana) {
          toast.error("Cotización generada. Habilite las ventanas emergentes para visualizarla de inmediato.", { duration: 6000 });
        }

        setTimeout(() => {
          navigate("/quotes", {
            state: {
              message: `Cotización #${res.data.quote_number} creada`,
              type: "success",
            },
          });
        }, 15000);
      } else {
        toast.error(res.message || "Error al generar la cotización");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Ocurrió un error al crear la cotización.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Recargar clientes y seleccionar el nuevo
  const fetchClients = async (selectNewId = null) => {
    try {
      setIsRefreshingClients(true);
      const clientsRes = await personService.getAll();
      const clientsData = clientsRes?.data || [];

      const filteredClients = Array.isArray(clientsData)
        ? clientsData.filter((person) => person.es_cliente == 1)
        : [];

      setClients(filteredClients);

      if (selectNewId) {
        const exists = filteredClients.find(
          (c) => c.id?.toString() === selectNewId.toString()
        );
        if (exists) {
          setFormData((prev) => ({ ...prev, client_id: selectNewId.toString() }));
          toast.success(`Cliente "${exists.nombre_completo}" seleccionado automáticamente`);
        }
      }
    } catch (err) {
      console.error("Error al recargar clientes:", err);
      toast.error("No se pudieron actualizar los clientes.");
    } finally {
      setIsRefreshingClients(false);
    }
  };

  const handleClientSaved = (newPerson) => {
    const newId = newPerson?.id || newPerson?.person_id;
    if (newId) {
      fetchClients(newId);
    } else {
      fetchClients();
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-12">
      {/* Header Corporativo */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Nueva Cotización
              </h1>
              <p className="text-blue-200 text-sm mt-0.5">
                Complete los datos para generar el documento oficial
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* === COLUMNA IZQUIERDA: DATOS PRINCIPALES === */}
            <div className="lg:col-span-3 space-y-6">
              {/* Card Cliente + Vehículo */}
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-100">
                  <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Datos de la Operación
                  </h2>
                </div>

                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Cliente con botón nuevo */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Cliente *
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowClientModal(true)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                          title="Agregar nuevo cliente"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Nuevo cliente
                        </button>
                      </div>
                      <div className="relative">
                        <SearchableSelect
                          options={clients}
                          value={formData.client_id}
                          onChange={(val) => handleChange("client_id", val)}
                          placeholder="Buscar por nombre o RUT..."
                          renderOption={(c) => `${c.nombre_completo} (${c.rut})`}
                        />
                        {isRefreshingClients && (
                          <div className="absolute right-10 top-2.5">
                            <svg className="animate-spin h-4 w-4 text-blue-600" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Vehículo *
                      </label>
                      <SearchableSelect
                        options={vehicles}
                        value={formData.vehicle_id}
                        onChange={(val) => handleChange("vehicle_id", val)}
                        placeholder="Buscar por marca o patente..."
                        renderOption={(v) =>
                          `${v.make} ${v.model} - ${v.plate}`
                        }
                      />
                    </div>
                  </div>

                  {/* Info del vehículo seleccionado */}
                  {selectedVehicle && (
                    <div className="bg-blue-50/80 rounded-xl p-4 border border-blue-100">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                            />
                          </svg>
                        </div>
                        <span className="text-sm font-bold text-blue-900">
                          Vehículo Seleccionado
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="bg-white rounded-lg p-2.5 border border-blue-100">
                          <p className="text-xs text-gray-500 mb-0.5">Marca</p>
                          <p className="font-semibold text-gray-800">
                            {selectedVehicle.make}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-2.5 border border-blue-100">
                          <p className="text-xs text-gray-500 mb-0.5">Modelo</p>
                          <p className="font-semibold text-gray-800">
                            {selectedVehicle.model}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-2.5 border border-blue-100">
                          <p className="text-xs text-gray-500 mb-0.5">Año</p>
                          <p className="font-semibold text-gray-800">
                            {selectedVehicle.year}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-2.5 border border-blue-100">
                          <p className="text-xs text-gray-500 mb-0.5">
                            Patente
                          </p>
                          <p className="font-semibold text-gray-800">
                            {selectedVehicle.plate}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Precios + Descuento Global */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Precio de Venta Listado
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          readOnly
                          className="w-full px-3 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm font-mono font-semibold text-gray-600 cursor-not-allowed"
                          value={
                            formData.precio_venta
                              ? formatMoney(formData.precio_venta)
                              : ""
                          }
                          placeholder="0"
                        />
                      </div>
                      <p className="text-xs text-gray-400">
                        Precio listado del vehículo
                      </p>
                    </div>

                    {/* Descuento Global */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Descuento Global
                      </label>
                      <div className="flex gap-2">
                        <div className="flex items-center bg-gray-100 rounded-lg p-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleGlobalDiscountChange("type", "amount")}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                              globalDiscount.type === "amount"
                                ? "bg-white text-blue-700 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                          >
                            $
                          </button>
                          <button
                            type="button"
                            onClick={() => handleGlobalDiscountChange("type", "percentage")}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                              globalDiscount.type === "percentage"
                                ? "bg-white text-blue-700 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                          >
                            %
                          </button>
                        </div>
                        <input
                          type="text"
                          className="flex-1 px-3 py-2.5 bg-white border-2 border-blue-200 rounded-xl text-sm font-mono font-bold text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          value={globalDiscount.value ? formatMoney(globalDiscount.value) : ""}
                          onChange={(e) =>
                            handleGlobalDiscountChange("value", e.target.value.replace(/[^\d]/g, ""))
                          }
                          placeholder={globalDiscount.type === "percentage" ? "0%" : "0"}
                        />
                      </div>
                      <p className="text-xs text-gray-400">
                        {globalDiscount.type === "percentage"
                          ? "Descuento porcentual sobre el total de ítems"
                          : "Descuento fijo en pesos sobre el total"}
                      </p>
                    </div>
                  </div>

                  {/* Precio Ofrecido Final (calculado, solo lectura) */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                          Precio Ofrecido Final
                        </p>
                        <p className="text-xs text-blue-400 mt-0.5">
                          Total ítems {formatMoney(totalItems.toString())}
                          {descuentoGlobal > 0 && (
                            <span className="text-red-500">
                              {" "}- Descuento {formatMoney(descuentoGlobal.toString())}
                            </span>
                          )}
                        </p>
                      </div>
                      <span className="text-2xl font-bold font-mono text-blue-900">
                        {formatMoney(precioOfrecido.toString())}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Válido Hasta *
                      </label>
                      <input
                        type="date"
                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        value={formData.valid_until}
                        min={formData.quote_date}
                        onChange={(e) =>
                          handleChange("valid_until", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Fecha Emisión *
                      </label>
                      <input
                        type="date"
                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        value={formData.quote_date}
                        onChange={(e) =>
                          handleChange("quote_date", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Notas */}
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-100">
                  <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Notas y Condiciones
                  </h2>
                </div>
                <div className="p-6">
                  <textarea
                    rows="4"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all resize-none"
                    placeholder="Ej: Incluye transferencia, revisión técnica al día, garantía de 3 meses..."
                    value={formData.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* === COLUMNA DERECHA: ÍTEMS === */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-blue-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    Detalle de Ítems
                  </h2>
                  <button
                    type="button"
                    onClick={addItem}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-900 bg-white rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Agregar
                  </button>
                </div>

                <div className="p-4 max-h-[600px] overflow-y-auto space-y-3">
                  {items.map((item, index) => {
                    const isVehicleItem = index === 0;
                    return (
                    <div
                      key={item.id}
                      className={`rounded-xl border p-4 transition-all duration-200 group ${
                        isVehicleItem
                          ? "bg-gradient-to-br from-blue-50 to-white border-blue-200"
                          : "bg-gradient-to-br from-gray-50 to-white border-gray-200 hover:border-blue-300 hover:shadow-md"
                      }`}
                    >
                      {/* Header de Card */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isVehicleItem
                              ? "bg-blue-600 text-white"
                              : "bg-blue-100 text-blue-700"
                          }`}>
                            {index + 1}
                          </span>
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                            {isVehicleItem ? "Vehículo" : "Ítem"}
                          </span>
                          {isVehicleItem && (
                            <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">
                              NO EDITABLE
                            </span>
                          )}
                        </div>
                        {!isVehicleItem && (
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-gray-300 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
                            title="Eliminar ítem"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        )}
                      </div>

                      {/* Descripción */}
                      <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Descripción {isVehicleItem ? "" : "*"}
                        </label>
                        <input
                          type="text"
                          readOnly={isVehicleItem}
                          className={`w-full px-3 py-2 border rounded-lg text-sm transition-all ${
                            isVehicleItem
                              ? "bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed"
                              : "bg-white border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          }`}
                          value={item.descripcion}
                          onChange={(e) =>
                            !isVehicleItem && updateItem(item.id, "descripcion", e.target.value)
                          }
                          placeholder={isVehicleItem ? "Vehículo seleccionado" : "Ej: Seguro, accesorios..."}
                        />
                      </div>

                      {/* Cantidad + Precio */}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Cantidad
                          </label>
                          <input
                            type="number"
                            min="1"
                            readOnly={isVehicleItem}
                            className={`w-full px-3 py-2 border rounded-lg text-sm text-center transition-all ${
                              isVehicleItem
                                ? "bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed"
                                : "bg-white border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            }`}
                            value={item.cantidad}
                            onChange={(e) =>
                              !isVehicleItem && updateItem(item.id, "cantidad", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            P. Unitario *
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              className={`w-full pl-5 pr-2 py-2 border rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                isVehicleItem
                                  ? "bg-amber-50 border-amber-200 text-amber-900"
                                  : "bg-white border-gray-200"
                              }`}
                              value={
                                item.precio_unitario
                                  ? formatMoney(item.precio_unitario)
                                  : ""
                              }
                              onChange={(e) =>
                                updateItem(
                                  item.id,
                                  "precio_unitario",
                                  e.target.value.replace(/[^\d]/g, ""),
                                )
                              }
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Descuento por ítem - solo para ítems adicionales */}
                      {!isVehicleItem && (
                        <div className="mb-3">
                          {(item.descuento_porcentaje > 0 ||
                            item.descuento_monto > 0) && (
                            <div className="flex items-center gap-2 bg-amber-50 rounded-lg p-2 border border-amber-100">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                className="w-16 px-2 py-1 border border-gray-200 rounded text-sm text-center focus:ring-2 focus:ring-blue-500"
                                value={item.descuento_porcentaje || ""}
                                onChange={(e) => {
                                  updateItem(
                                    item.id,
                                    "descuento_porcentaje",
                                    e.target.value,
                                  );
                                  updateItem(item.id, "descuento_monto", 0);
                                }}
                                placeholder="%"
                              />
                              <span className="text-xs text-gray-400">o</span>
                              <div className="relative">
                                <input
                                  type="text"
                                  className="w-20 pl-4 pr-1 py-1 border border-gray-200 rounded text-sm font-mono focus:ring-2 focus:ring-blue-500"
                                  value={
                                    item.descuento_monto
                                      ? formatMoney(
                                          item.descuento_monto.toString(),
                                        )
                                      : ""
                                  }
                                  onChange={(e) => {
                                    updateItem(
                                      item.id,
                                      "descuento_monto",
                                      e.target.value.replace(/[^\d]/g, ""),
                                    );
                                    updateItem(
                                      item.id,
                                      "descuento_porcentaje",
                                      0,
                                    );
                                  }}
                                  placeholder="0"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Subtotal del ítem */}
                      <div className={`rounded-lg p-2.5 border ${
                        isVehicleItem
                          ? "bg-blue-100 border-blue-200"
                          : "bg-blue-50 border-blue-100"
                      }`}>
                        <div className="flex justify-between items-center">
                          <span className={`text-xs font-medium ${
                            isVehicleItem ? "text-blue-700" : "text-blue-600"
                          }`}>
                            {isVehicleItem ? "Valor Vehículo" : "Subtotal Ítem"}
                          </span>
                          <span className={`text-sm font-bold font-mono ${
                            isVehicleItem ? "text-blue-900" : "text-blue-800"
                          }`}>
                            {formatMoney(item.subtotal.toString())}
                          </span>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>

                {/* Totales */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-4 py-5">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Subtotal Bruto</span>
                      <span className="font-mono font-medium text-white">
                        {formatMoney(totalBruto.toString())}
                      </span>
                    </div>
                    {totalDescuentosItems > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-red-400">Desc. por Ítems</span>
                        <span className="font-mono font-medium text-red-400">
                          -{formatMoney(totalDescuentosItems.toString())}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-dashed border-gray-600 pt-2 flex justify-between text-sm">
                      <span className="text-gray-300">Total Ítems</span>
                      <span className="font-mono font-medium text-white">
                        {formatMoney(totalItems.toString())}
                      </span>
                    </div>
                    {descuentoGlobal > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-amber-400">Desc. Global ({globalDiscount.type === "percentage" ? globalDiscount.value + "%" : "fijo"})</span>
                        <span className="font-mono font-medium text-amber-400">
                          -{formatMoney(descuentoGlobal.toString())}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-gray-600 pt-2 flex justify-between items-center">
                      <span className="text-sm font-bold text-white uppercase tracking-wide">
                        Precio Ofrecido
                      </span>
                      <span className="text-lg font-bold font-mono text-blue-400">
                        {formatMoney(precioOfrecido.toString())}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Badge de validación */}
              {precioOfrecido > 0 && (
                <div className="rounded-xl p-3 text-center text-sm font-medium border bg-green-50 text-green-700 border-green-200">
                  ✓ Precio calculado: {formatMoney(precioOfrecido.toString())}
                </div>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="mt-8 flex justify-end items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/quotes")}
              className="px-6 py-3 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all shadow-sm"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex items-center gap-2 px-8 py-3 text-sm font-bold text-white rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-all transform hover:scale-105
                ${isSubmitting ? "bg-blue-400 cursor-not-allowed shadow-none" : "bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 hover:shadow-xl"}
              `}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Generando PDF...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Generar Cotización
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Modal de Nuevo Cliente */}
      <PersonFormModal
        isOpen={showClientModal}
        onClose={() => setShowClientModal(false)}
        onSaved={handleClientSaved}
        personToEdit={null}
        forceCliente={true}
        forceProveedor={false}

      />
    </div>
  );
};

export default QuoteForm;
