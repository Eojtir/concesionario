/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useMemo } from "react";
import lotService from "../../services/lotService";
import { Link } from "react-router-dom";
import { DataTable } from "../ui/DataTable";
import { Modal } from "../ui/Modal";
import { Loading } from '../ui/Loading';
import toast from "react-hot-toast";
import { FiMapPin, FiSearch, FiChevronLeft, FiChevronRight, FiPlus } from 'react-icons/fi';

const LotList = () => {
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [lotToDelete, setLotToDelete] = useState(null);

  // Estados para Búsqueda y Paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadLots();
  }, []);

  const loadLots = async () => {
    try {
      setLoading(true);
      const response = await lotService.getAll();
      if (response?.success && Array.isArray(response.data)) {
        setLots(response.data);
      } else {
        setLots(response || []);
      }
    } catch (error) {
      console.error('Error cargando lotes:', error);
      toast.error("Error al cargar la lista de lotes");
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DE FILTRADO ---
  const filteredLots = useMemo(() => {
    return lots.filter(l => {
      const search = searchTerm.toLowerCase();
      return (
        l.name?.toLowerCase().includes(search) ||
        l.address?.toLowerCase().includes(search)
      );
    });
  }, [lots, searchTerm]);

  // --- LÓGICA DE PAGINACIÓN ---
  const totalPages = Math.ceil(filteredLots.length / itemsPerPage);
  const currentItems = filteredLots.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = async () => {
    if (!lotToDelete?.id) return; 
    try {
      const response = await lotService.delete(lotToDelete.id);
      if (response?.success) {
        setLots(prevLots => prevLots.filter(l => l.id !== lotToDelete.id));
        setDeleteModal(false);
        setLotToDelete(null);
        toast.success(response.message || "Lote eliminado correctamente");
      } else {
        toast.error(response.message || "No se pudo eliminar el lote");
      }
    } catch (error) {
      toast.error("Error de conexión al eliminar");
    }
  };

  const columns = [
    { 
      key: 'name', 
      label: 'NOMBRE',
      render: (row) => <span className="font-bold text-gray-200">{row.name}</span>
    },
    { key: 'address', label: 'DIRECCIÓN' },
    { 
      key: 'capacity', 
      label: 'CAPACIDAD',
      render: (row) => <span className="font-medium">{row.capacity} autos</span>
    },
    { 
      key: 'vehicle_count', 
      label: 'OCUPADO',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full ${row.vehicle_count >= row.capacity ? 'bg-red-500' : 'bg-blue-500'}`}
              style={{ width: `${Math.min((row.vehicle_count / row.capacity) * 100, 100)}%` }}
            ></div>
          </div>
          <span className="text-xs font-bold text-gray-600">{row.vehicle_count}</span>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (row) => (
        <div className="flex space-x-3">
          <Link
            to={`/lots/edit/${row.id}`}
            className="text-blue-600 hover:text-blue-800 font-bold text-sm"
          >
            Editar
          </Link>
          <button
            onClick={() => {
              setLotToDelete(row);
              setDeleteModal(true);
            }}
            className="text-red-600 hover:text-red-800 font-bold text-sm"
          >
            Eliminar
          </button>
        </div>
      )
    }
  ];

  if (loading && lots.length === 0) return <Loading />;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
    <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent inline-flex">
            <FiMapPin className="text-blue-600" /> Mis Lotes / Sucursales
          </h1>
          <p className="text-sm text-gray-500">Gestiona las ubicaciones físicas de tu inventario</p>
        </div>
        <Link
          to="/lots/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-md font-bold"
        >
          <FiPlus /> Nuevo Lote
        </Link>
      </div>

      {/* Buscador */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text"
          placeholder="Buscar por nombre o dirección..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Tabla con Estilo Claro */}
      <div className="bg-white shadow rounded-xl border border-gray-200 overflow-hidden">
        <DataTable
          columns={columns}
          data={currentItems}
          loading={loading}
        />

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Mostrando <span className="font-bold">{currentItems.length}</span> de <span className="font-bold">{filteredLots.length}</span> lotes
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <FiChevronLeft />
              </button>
              <span className="flex items-center px-4 text-sm font-medium text-gray-700">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de eliminación Claro */}
      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Eliminar Lote"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            ¿Confirmas la eliminación del lote <strong className="text-gray-900">{lotToDelete?.name}</strong>?
          </p>
          <div className="p-3 bg-amber-50 text-amber-800 text-xs rounded border border-amber-100">
            Nota: Solo se recomienda eliminar lotes vacíos para evitar inconsistencias en el inventario.
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setDeleteModal(false)}
              className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition shadow-sm"
            >
              Eliminar Lote
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LotList;