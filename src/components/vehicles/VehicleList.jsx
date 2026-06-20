import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DataTable } from "../ui/DataTable";
import { Modal } from "../ui/Modal";
import { useVehicles } from "../../hooks/useVehicles";
import { Loading } from "../ui/Loading";
import { formatMoney } from "../../utils/formatters";
import {
  FiSearch,
  FiPlus,
  FiChevronLeft,
  FiChevronRight,
  FiEdit2,
  FiTrash2,
  FiTool,
  FiFileText,
  FiDollarSign,
  FiInfo,
  FiArrowUp,
  FiArrowDown,
} from "react-icons/fi";

const VehicleList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get('status');
  
  const { vehicles, loading, deleteVehicle, fetchVehicles } = useVehicles();

  const [deleteModal, setDeleteModal] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  // Estados para Búsqueda y Paginación
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  // ESTADOS DE ORDENAMIENTO
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const statusConfig = {
    available: {
      text: "Disponible",
      class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      dot: "bg-emerald-400",
    },
    reserved: {
      text: "Reservado",
      class: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      dot: "bg-amber-400",
    },
    maintenance: {
      text: "Mantenimiento",
      class: "bg-slate-500/10 text-slate-400 border-slate-500/20",
      dot: "bg-slate-400",
    },
  };

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  // --- LÓGICA DE FILTRADO Y ORDENAMIENTO ---
  const filteredAndSortedVehicles = useMemo(() => {
    const filtered = vehicles.filter((v) => {
      if (v.status?.toLowerCase() === "sold") return false;
      if (statusFilter && v.status?.toLowerCase() !== statusFilter.toLowerCase()) return false;
      
      const search = searchTerm.toLowerCase();
      const matchMake = v.make?.toLowerCase().includes(search);
      const matchModel = v.model?.toLowerCase().includes(search);
      const matchPlate = v.plate?.toLowerCase().includes(search);
      const matchVin = v.vin?.toLowerCase().includes(search);
      const matchStatus = v.status?.toLowerCase().includes(search);
      const matchId = v.id?.toString().includes(search);

      return matchMake || matchModel || matchPlate || matchVin || matchStatus || matchId;
    });

    return [...filtered].sort((a, b) => {
      let valA, valB;

      switch (sortBy) {
        case "identification":
          valA = (a.plate || "").toLowerCase();
          valB = (b.plate || "").toLowerCase();
          break;
        case "price":
          valA = a.sale_price || 0;
          valB = b.sale_price || 0;
          break;
        case "status":
          valA = (statusConfig[a.status]?.text || "").toLowerCase();
          valB = (statusConfig[b.status]?.text || "").toLowerCase();
          break;
        case "name":
        default:
          valA = `${a.make} ${a.model}`.toLowerCase();
          valB = `${b.make} ${b.model}`.toLowerCase();
          break;
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [vehicles, searchTerm, statusFilter, sortBy, sortOrder]);

  // --- LÓGICA DE PAGINACIÓN ---
  const totalPages = Math.ceil(filteredAndSortedVehicles.length / itemsPerPage);
  const currentItems = filteredAndSortedVehicles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

  // --- HANDLERS DE ACCIONES ---
  const handleEdit = (row) => {
    navigate(`/vehicles/edit/${row.id}`);
  };

  const handleExpenses = (row) => {
    navigate(`/vehicles/${row.id}/expenses`);
  };

  const handleQuote = (row) => {
    navigate(`/quotes/new/?vehicle_id=${row.id}`);
  };

  const handleSell = (row) => {

    navigate(`/sales/new?vehicle_id=${row.id}`);
  };

  const handleDeleteClick = (row) => {
    setVehicleToDelete(row);
    setDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!vehicleToDelete) return;
    const success = await deleteVehicle(vehicleToDelete.id);
    if (success) {
      setDeleteModal(false);
      setVehicleToDelete(null);
    }
  };

  const renderSortableHeader = (label, key) => {
    const isActive = sortBy === key;
    return (
      <button
        onClick={() => handleSort(key)}
        className="group inline-flex items-center gap-1.5 font-bold tracking-wider text-xs uppercase text-gray-400 hover:text-cyan-400 transition-colors focus:outline-none"
      >
        <span>{label}</span>
        <span className="flex items-center text-gray-500 transition-colors">
          {isActive ? (
            sortOrder === "asc" ? (
              <FiArrowUp className="w-3.5 h-3.5 text-cyan-400 animate-fade-in" />
            ) : (
              <FiArrowDown className="w-3.5 h-3.5 text-cyan-400 animate-fade-in" />
            )
          ) : (
            <FiArrowUp className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50 group-hover:text-cyan-400 transition-all" />
          )}
        </span>
      </button>
    );
  };

  // --- COLUMNAS CON BOTONES TIPO CARD ---
  const columns = [
    {
      key: "make",
      label: renderSortableHeader("Vehículo", "name"),
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="hidden sm:block p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
            <FiSearch className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white">
              {row.make} {row.model}
            </div>
            <div className="text-gray-400 text-sm">
              {row.year} • {row.color}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "plate",
      label: renderSortableHeader("Patente", "identification"),
      render: (row) => (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/15 to-blue-500/15 border border-cyan-500/25">
          <span className="text-white font-mono font-bold tracking-widest">
            {row.plate || "SIN PLACA"}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      label: renderSortableHeader("Estado", "status"),
      render: (row) => {
        const config = statusConfig[row.status] || statusConfig.available;
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.class}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
            {config.text}
          </span>
        );
      },
    },
    {
      key: "prices",
      label: renderSortableHeader("Precios venta", "price"),
      render: (row) => (
        <div className="text-sm">
          <div className="text-white font-bold">
            {formatMoney(row.sale_price)}
          </div>
          {/* <div className="text-slate-400 text-xs">
            Costo: {formatMoney(row.purchase_price)}
          </div> */}
        </div>
      ),
    },
    {
      key: "actions",
      label: <span className="text-xs uppercase tracking-wider text-gray-400 font-bold">Acciones</span>,
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="flex flex-col items-center gap-0.5 p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/25 hover:border-cyan-500/40 transition-all group/btn min-w-[60px]"
            title="Editar"
          >
            <FiEdit2 className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
            <span className="text-[9px] font-bold">Editar</span>
          </button>

          <button
            onClick={() => handleExpenses(row)}
            className="flex flex-col items-center gap-0.5 p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/25 hover:border-purple-500/40 transition-all group/btn min-w-[60px]"
            title="Gastos"
          >
            <FiTool className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
            <span className="text-[9px] font-bold">Gastos</span>
          </button>

          <button
            onClick={() => handleQuote(row)}
            className="flex flex-col items-center gap-0.5 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/25 hover:border-emerald-500/40 transition-all group/btn min-w-[60px]"
            title="Cotizar"
          >
            <FiFileText className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
            <span className="text-[9px] font-bold">Cotizar</span>
          </button>

          <button
            onClick={() => handleSell(row)}
            className="flex flex-col items-center gap-0.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/25 hover:border-amber-500/40 transition-all group/btn min-w-[60px]"
            title="Vender"
          >
            <FiDollarSign className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
            <span className="text-[9px] font-bold">Vender</span>
          </button>

          <button
            onClick={() => handleDeleteClick(row)}
            className="flex flex-col items-center gap-0.5 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/25 hover:border-rose-500/40 transition-all group/btn min-w-[60px]"
            title="Eliminar"
          >
            <FiTrash2 className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
            <span className="text-[9px] font-bold">Borrar</span>
          </button>
        </div>
      ),
    },
  ];

  if (loading && vehicles.length === 0) return <Loading />;

  return (
    <div className="max-w-[1600px] mx-auto p-4 lg:p-8 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
            Inventario de Vehículos
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Control de flota y disponibilidad en tiempo real
          </p>
        </div>
        <button
          onClick={() => navigate("/vehicles/new")}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all"
        >
          <FiPlus className="w-5 h-5" />
          Nuevo Vehículo
        </button>
      </div>

      {/* Indicador de Filtro Activo desde URL */}
      {statusFilter && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between">
          <span className="text-amber-400 text-sm">
            Filtrando por estado: <strong className="text-amber-300">{statusFilter}</strong>
          </span>
          <button
            onClick={() => navigate("/vehicles")}
            className="text-xs px-3 py-1 bg-amber-500/20 text-amber-300 rounded-lg hover:bg-amber-500/30 transition-colors"
          >
            Limpiar filtro
          </button>
        </div>
      )}

      {/* Barra de Búsqueda Total */}
      <div className="relative w-full">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10" />
        <input
          type="text"
          placeholder="Buscar por marca, modelo, patente, VIN o ID..."
          className="w-full bg-slate-800/40 border border-cyan-500/20 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all backdrop-blur-sm"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Table Container */}
      <div className="bg-slate-800/40 border border-cyan-500/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
        <DataTable
          columns={columns}
          data={currentItems}
          loading={loading}
          emptyMessage={
            <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-2">
              <FiSearch className="w-12 h-12 text-gray-600" />
              <p>
                No se encontraron vehículos activos
                {searchTerm ? ` para "${searchTerm}"` : ""}
              </p>
            </div>
          }
        />

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-900/50 border-t border-cyan-500/10 flex items-center justify-between">
            <span className="text-sm text-gray-400">
              Mostrando <span className="text-cyan-400 font-bold">{currentItems.length}</span> de <span className="text-white font-bold">{filteredAndSortedVehicles.length}</span>
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 bg-slate-700 rounded-lg text-white disabled:opacity-30 hover:bg-cyan-600 transition-colors"
              >
                <FiChevronLeft />
              </button>
              <div className="flex items-center px-4 text-sm font-bold text-cyan-400">
                Página {currentPage} de {totalPages}
              </div>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 bg-slate-700 rounded-lg text-white disabled:opacity-30 hover:bg-cyan-600 transition-colors"
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Eliminar Vehículo"
      >
        <div className="space-y-6">
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
            <p className="text-gray-200">
              ¿Confirmas la eliminación de: <span className="text-white font-bold">{vehicleToDelete?.make} {vehicleToDelete?.model}</span>?
            </p>
          </div>
          <p className="text-xs text-rose-400 flex items-center gap-2">
            <FiInfo /> Esta acción no se puede deshacer y el vehículo será removido del inventario activo.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteModal(false)}
              className="px-5 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              className="px-6 py-2 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-rose-500/20 transition-all"
            >
              Eliminar Definitivamente
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VehicleList;