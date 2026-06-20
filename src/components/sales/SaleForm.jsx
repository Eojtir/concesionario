import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import SaleReferenceTab from "./tabs/SaleReferenceTab";

// Servicios
import personService from "../../services/personService";
import vehicleService from "../../services/vehicleService";

// Componentes UI
import { Loading } from "../ui/Loading";
import SearchableSelect from "../molecules/SearchableSelect";
import { formatMoney } from "../../utils/formatters";

// Modal de cliente
import PersonFormModal from "../directory/PersonFormModal";
import SaleNegotiationTab from "./tabs/SaleNegotiationTab";

// ============================================
// PESTAÑAS DEL MÓDULO DE VENTA
// ============================================
const TABS = [
  {
    id: "negociacion",
    label: "Negociación",
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    id: "referencias",
    label: "Valores Ref.",
    icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z",
  },
  {
    id: "accesorios",
    label: "Accesorios",
    icon: "M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z",
  },
  {
    id: "pagos",
    label: "Formas de Pago",
    icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z",
  },
];

const SaleForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("referencias");

  const [clients, setClients] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);

  // Modal de nuevo cliente
  const [showClientModal, setShowClientModal] = useState(false);
  const [isRefreshingClients, setIsRefreshingClients] = useState(false);

  // Datos de la operación
  const [saleData, setSaleData] = useState({
    client_id: "",
    vehicle_id: "",
    sale_date: new Date().toISOString().split("T")[0],
    seller_notes: "",
  });

  // Referencia a la pestaña de referencias para auto-save
  const referenceTabRef = useRef(null);
  const [referenceHasChanges, setReferenceHasChanges] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Totales de referencia para pasar a negociación
  const [referenceTotals, setReferenceTotals] = useState({
    totalReferencia: 0,
    totalPagaCliente: 0,
    totalRegalo: 0,
    totalCreditoExt: 0,
    totalGastos: 0,
  });

  // ============================================
  // CARGA INICIAL
  // ============================================
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

  // Cargar vehicle_id desde URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const vehicleId = params.get("vehicle_id") || params.get("vehicleId");
    if (vehicleId) {
      setSaleData((prev) => ({ ...prev, vehicle_id: vehicleId }));
    }
  }, [location.search]);

  // Auto-seleccionar vehículo
  useEffect(() => {
    if (saleData.vehicle_id && vehicles.length > 0) {
      const selected = vehicles.find(
        (v) =>
          v.id?.toString() === saleData.vehicle_id?.toString() ||
          v.vehicle_id?.toString() === saleData.vehicle_id?.toString(),
      );
      setSelectedVehicle(selected || null);
    } else if (!saleData.vehicle_id) {
      setSelectedVehicle(null);
    }
  }, [saleData.vehicle_id, vehicles]);

  // Auto-seleccionar cliente
  useEffect(() => {
    if (saleData.client_id && clients.length > 0) {
      const client = clients.find(
        (c) => c.id?.toString() === saleData.client_id?.toString(),
      );
      setSelectedClient(client || null);
    } else {
      setSelectedClient(null);
    }
  }, [saleData.client_id, clients]);

  // ============================================
  // HANDLERS
  // ============================================
  const handleChange = (field, value) => {
    setSaleData((prev) => ({ ...prev, [field]: value }));
  };

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
          (c) => c.id?.toString() === selectNewId.toString(),
        );
        if (exists) {
          setSaleData((prev) => ({
            ...prev,
            client_id: selectNewId.toString(),
          }));
          toast.success(
            `Cliente "${exists.nombre_completo}" seleccionado automáticamente`,
          );
        }
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error al actualizar la lista de clientes");
    } finally {
      setIsRefreshingClients(false);
    }
  };

  const handleClientSaved = (newPerson) => {
    const newId = newPerson?.id || newPerson?.person_id;
    if (newId) fetchClients(newId);
    else fetchClients();
  };

  // ============================================
  // CAMBIO DE PESTAÑA CON AUTO-SAVE
  // ============================================
  const handleTabChange = async (tabId) => {
    // Si estamos saliendo de la pestaña "referencias" y hay cambios sin guardar
    if (activeTab === "referencias" && referenceHasChanges && !isAutoSaving) {
      setIsAutoSaving(true);
      toast.loading("Guardando cambios automáticamente...", { id: "autosave" });

      try {
        // Disparar el guardado del componente hijo
        if (referenceTabRef.current?.save) {
          await referenceTabRef.current.save();
        }
        toast.success("Cambios guardados", { id: "autosave" });
      } catch (err) {
        console.error("Error en auto-save:", err);
        toast.error("No se pudieron guardar los cambios", { id: "autosave" });
        // No bloqueamos el cambio de pestaña, pero avisamos
      } finally {
        setIsAutoSaving(false);
        setReferenceHasChanges(false);
      }
    }

    setActiveTab(tabId);
  };

  // ============================================
  // VALIDACIÓN
  // ============================================
  const canProceed = selectedVehicle && selectedClient;

  // ============================================
  // RENDER CONTENIDO DE PESTAÑA
  // ============================================
  const renderTabContent = () => {
    switch (activeTab) {
      case "negociacion":
        return (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 text-center">


            {/* Mostrar totales de referencia si existen */}
            {referenceTotals.totalGastos > 0 && (
          <SaleNegotiationTab 
        vehicle={selectedVehicle} 
        referenceTotals={referenceTotals} 
        onTotalsChange={(calcState) => console.log(calcState)} 
/>
            )}

          </div>
        );
      case "pagos":
        return (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Formas de Pago
            </h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              Aquí se implementará el registro de efectivo, créditos,
              documentos, vehículo usado en parte de pago, etc.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium border border-amber-200">
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              En desarrollo - Próximamente
            </div>
          </div>
        );
      case "documentos":
        return (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-purple-600"
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
            <h3 className="text-lg font-bold text-gray-800 mb-2">Documentos</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              Aquí se implementará la gestión de contratos, facturas,
              certificados y documentación legal.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium border border-amber-200">
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              En desarrollo - Próximamente
            </div>
          </div>
        );
      case "referencias":
        return (
          <SaleReferenceTab
            ref={referenceTabRef}
            vehicleId={saleData.vehicle_id}
            onTotalsChange={setReferenceTotals}
            onSaveStateChange={setReferenceHasChanges}
          />
        );
      case "accesorios":
        return (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-pink-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Accesorios</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              Aquí se implementará el registro de accesorios, fletes, normas y
              equipamiento adicional.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium border border-amber-200">
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              En desarrollo - Próximamente
            </div>
          </div>
        );
      case "gastos":
        return (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Gastos</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              Aquí se implementará el detalle de gastos operacionales,
              comisiones y costos asociados.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium border border-amber-200">
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              En desarrollo - Próximamente
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-12">
      {/* ============================================ */}
      {/* HEADER CORPORATIVO                          */}
      {/* ============================================ */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
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
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Registro de Venta
                </h1>
                <p className="text-blue-200 text-sm mt-0.5">
                  Seleccione vehículo y cliente para iniciar la operación
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/sales")}
              className="text-white/70 hover:text-white transition-colors p-2"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        {/* ============================================ */}
        {/* CARD: SELECCIÓN DE VEHÍCULO Y CLIENTE        */}
        {/* ============================================ */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 ">
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
              Selección de Operación
            </h2>
          </div>

          <div className="p-6">
            {/* Selects - corregido z-index */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
              {/* COLUMNA VEHÍCULO */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Vehículo *
                  </label>
                  <SearchableSelect
                    options={vehicles}
                    value={saleData.vehicle_id}
                    onChange={(val) => handleChange("vehicle_id", val)}
                    placeholder="Buscar por marca, modelo o patente..."
                    renderOption={(v) =>
                      `${v.make} ${v.model} ${v.year} - ${v.plate}`
                    }
                  />
                </div>
                {selectedVehicle && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border-2 border-blue-200">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shrink-0">
                        <svg
                          className="w-7 h-7 text-white"
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
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-base font-bold text-blue-900 truncate">
                            {selectedVehicle.make} {selectedVehicle.model}
                          </h3>
                          <span className="text-lg font-bold font-mono text-blue-900 shrink-0">
                            {formatMoney(
                              selectedVehicle.sale_price?.toString() || "0",
                            )}
                          </span>
                        </div>
                        <p className="text-blue-700 text-sm mt-0.5">
                          <span className="inline-flex items-center gap-1 mr-3">
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            {selectedVehicle.year}
                          </span>
                          <span className="inline-flex items-center gap-1 mr-3">
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                              />
                            </svg>
                            <span className="font-mono font-bold">
                              {selectedVehicle.plate}
                            </span>
                          </span>
                          {selectedVehicle.color && (
                            <span className="inline-flex items-center gap-1 mr-3">
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                                />
                              </svg>
                              {selectedVehicle.color}
                            </span>
                          )}
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-blue-600">
                          {selectedVehicle.vin && (
                            <span className="font-mono">
                              VIN: {selectedVehicle.vin}
                            </span>
                          )}
                          {selectedVehicle.km && (
                            <span>
                              {selectedVehicle.km.toLocaleString("es-CL")} km
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* COLUMNA CLIENTE */}
              <div className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Cliente *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowClientModal(true)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
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
                      Nuevo cliente
                    </button>
                  </div>
                  <div className="relative">
                    <SearchableSelect
                      options={clients}
                      value={saleData.client_id}
                      onChange={(val) => handleChange("client_id", val)}
                      placeholder="Buscar por nombre o RUT..."
                      renderOption={(c) => `${c.nombre_completo} (${c.rut})`}
                    />
                    {isRefreshingClients && (
                      <div className="absolute right-10 top-2.5">
                        <svg
                          className="animate-spin h-4 w-4 text-blue-600"
                          viewBox="0 0 24 24"
                        >
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
                      </div>
                    )}
                  </div>
                </div>
                {selectedClient && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center shadow-md shrink-0">
                        <svg
                          className="w-7 h-7 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-green-900 truncate">
                          {selectedClient.nombre_completo}
                        </h3>
                        <p className="text-green-700 text-sm mt-1">
                          <span className="inline-flex items-center gap-1 mr-4">
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                              />
                            </svg>
                            <span className="font-mono font-bold">
                              {selectedClient.rut}
                            </span>
                          </span>
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-green-600">
                          {selectedClient.telefono && (
                            <span className="inline-flex items-center gap-1">
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                />
                              </svg>
                              {selectedClient.telefono}
                            </span>
                          )}
                          {selectedClient.email && (
                            <span className="inline-flex items-center gap-1">
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                              </svg>
                              {selectedClient.email}
                            </span>
                          )}
                          {selectedClient.direccion && (
                            <span className="inline-flex items-center gap-1">
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                              {selectedClient.direccion}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>


          </div>
        </div>

        {/* ============================================ */}
        {/* PESTAÑAS                                     */}
        {/* ============================================ */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          {/* Tabs Header */}
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto scrollbar-hide">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                const isDisabled = !canProceed && tab.id !== "negociacion";
                return (
                  <button
                    key={tab.id}
                    onClick={() => !isDisabled && handleTabChange(tab.id)}
                    disabled={isDisabled}
                    className={`relative flex items-center gap-2 px-5 py-3.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border-b-2 ${
                      isActive
                        ? "border-blue-600 text-blue-700 bg-blue-50/50"
                        : isDisabled
                          ? "border-transparent text-gray-300 cursor-not-allowed"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}
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
                        d={tab.icon}
                      />
                    </svg>
                    {tab.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">{renderTabContent()}</div>
        </div>
      </div>

      {/* Modal de Nuevo Cliente */}
      <PersonFormModal
        isOpen={showClientModal}
        onClose={() => setShowClientModal(false)}
        onSaved={handleClientSaved}
        personToEdit={null}
      />
    </div>
  );
};

export default SaleForm;