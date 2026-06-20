import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import quoteService from "../../services/quoteService";
import { formatMoney } from "../../utils/formatters";
import { formatDate } from "../../utils/formatDate";
import { DataTable } from "../ui/DataTable";
import { Loading } from "../ui/Loading";
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiFileText,
  FiInfo,
} from "react-icons/fi";

const QuoteList = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para Búsqueda y Paginación
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      const response = await quoteService.getAll();

      if (response?.success && Array.isArray(response.data)) {
        setQuotes(response.data);
      } else {
        console.error("Formato de respuesta inválido:", response);
        setQuotes([]);
      }
    } catch (error) {
      console.error("Error cargando cotizaciones:", error);
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DE FILTRADO ---
  const filteredQuotes = useMemo(() => {
    return quotes.filter((q) => {
      const search = searchTerm.toLowerCase();
      const clientName = q.client?.name?.toLowerCase() || "";
      const vehicleInfo =
        `${q.vehicle?.make} ${q.vehicle?.model} ${q.vehicle?.plate}`.toLowerCase();
      const id = q.id.toString();

      return (
        clientName.includes(search) ||
        vehicleInfo.includes(search) ||
        id.includes(search)
      );
    });
  }, [quotes, searchTerm]);

  // --- LÓGICA DE PAGINACIÓN ---
  const totalPages = Math.ceil(filteredQuotes.length / itemsPerPage);
  const currentItems = filteredQuotes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

  // --- DEFINICIÓN DE COLUMNAS ---
  const columns = [
    {
      key: "id",
      label: "ID",
      render: (row) => (
        <span className="font-bold text-gray-500">#{row.id}</span>
      ),
    },
    {
      key: "date",
      label: "Fecha",
      render: (row) => (
        <span className="text-gray-300 text-sm">{formatDate(row.date)}</span>
      ),
    },
    {
      key: "client",
      label: "Cliente",
      render: (row) => (
        <div>
          <div className="font-semibold text-gray-400">
            {row.client?.name || "Cliente Desconocido"}
          </div>
          <div className="text-xs text-gray-400">{row.client?.rut}</div>
        </div>
      ),
    },
    {
      key: "vehicle",
      label: "Vehículo",
      render: (row) => (
        <div className="text-gray-600 text-sm">
          {row.vehicle ? `${row.vehicle.make} ${row.vehicle.model}` : "N/A"}
          <span className="block text-xs font-mono text-gray-400">
            {row.vehicle?.plate}
          </span>
        </div>
      ),
    },
    {
      key: "price",
      label: "Precio",
      render: (row) => (
        <span className="text-slate-300 font-bold">
          {formatMoney(row.price)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Estado",
      render: (row) => (
        <span
          className={`px-3 py-1 text-xs font-bold rounded-full ${
            row.status === "pending"
              ? "bg-amber-100 text-amber-700"
              : row.status === "approved"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-100 text-slate-700"
          }`}
        >
          {row.status === "pending"
            ? "Pendiente"
            : row.status === "approved"
              ? "Aprobada"
              : row.status}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Acciones",
      render: (row) => (
        <div className="flex justify-end">
          <Link
            to={`https://clientes.inverprado.com/${row.ruta}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold text-sm bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-all"
          >
            Ver PDF
          </Link>
        </div>
      ),
    },
  ];

  if (loading && quotes.length === 0) return <Loading />;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent inline-flex">
            <FiFileText className="text-blue-600" /> Cotizaciones
          </h1>
          <p className="text-sm text-gray-400">
            Gestiona los presupuestos emitidos a clientes
          </p>
        </div>
        <Link
          to="/quotes/new"
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow-md hover:bg-blue-700 transition-all font-semibold"
        >
          + Nueva Cotización
        </Link>
      </div>

      {/* Barra de Búsqueda */}
      <div className="relative group">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
        <input
          type="text"
          placeholder="Buscar por cliente, vehículo o ID..."
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Tabla con DataTable */}
      <div className="bg-white shadow-lg rounded-2xl border border-gray-100 overflow-hidden">
        <DataTable
          columns={columns}
          data={currentItems}
          loading={loading}
          emptyMessage={
            <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-2">
              <FiSearch className="w-12 h-12 text-gray-200" />
              <p>No se encontraron resultados para "{searchTerm}"</p>
            </div>
          }
        />

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Mostrando{" "}
              <span className="font-bold">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>{" "}
              a{" "}
              <span className="font-bold">
                {Math.min(currentPage * itemsPerPage, filteredQuotes.length)}
              </span>{" "}
              de <span className="font-bold">{filteredQuotes.length}</span>{" "}
              resultados
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 transition-all"
              >
                <FiChevronLeft />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => goToPage(i + 1)}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                    currentPage === i + 1
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 transition-all"
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuoteList;
