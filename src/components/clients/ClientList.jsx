import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import clientService from "../../services/clientService";
import { DataTable } from "../ui/DataTable";
import { Loading } from '../ui/Loading';
import { FiSearch, FiUser, FiPhone, FiMapPin } from 'react-icons/fi';

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchClients = async (query = '') => {
    setLoading(true);
    try {
      const response = await clientService.getAll(query);
      
      if (response?.success && Array.isArray(response.data)) {
        setClients(response.data);
      } else {
        console.error('Formato de respuesta inválido:', response);
        setClients([]);
      }
    } catch (error) {
      console.error("Error fetching clients", error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchClients(search);
  };

  const columns = [
    { 
      key: 'name', 
      label: 'Nombre',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
            <FiUser />
          </div>
          <div className="font-semibold text-gray-300">{row.name}</div>
        </div>
      )
    },
    { 
      key: 'rut', 
      label: 'RUT',
      render: (row) => (
        <span className="text-gray-300 font-mono">{row.rut}</span>
      )
    },
    { 
      key: 'contact', 
      label: 'Contacto',
      render: (row) => (
        <div>
          <div className="flex items-center gap-1 text-sm text-gray-300">
            <FiPhone className="w-3 h-3" />
            {row.phone}
          </div>
          <div className="text-xs text-blue-600">{row.email}</div>
        </div>
      )
    },
    { 
      key: 'city', 
      label: 'Ciudad',
      render: (row) => (
        <div className="flex items-center gap-1 text-gray-300">
          <FiMapPin className="w-3 h-3" />
          {row.city}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (row) => (
        <div className="flex justify-center">
          <Link 
            to={`/clients/edit/${row.id}`} 
            className="text-blue-600 hover:text-blue-800 font-medium text-sm bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-all"
          >
            Editar
          </Link>
        </div>
      )
    }
  ];

  if (loading && clients.length === 0) {
    return <Loading />;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
 <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent inline-flex">
            <FiUser className="text-blue-600" /> Cartera de Clientes
          </h1>
          <p className="text-sm text-gray-300">Gestiona tus contactos y clientes</p>
        </div>
        <Link 
          to="/clients/new" 
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow-md hover:bg-blue-700 transition-all font-semibold"
        >
          + Nuevo Cliente
        </Link>
      </div>

      {/* Barra de Búsqueda */}
      <form onSubmit={handleSearch} className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text" 
          placeholder="Buscar por Nombre o RUT..." 
          className="w-full pl-10 pr-24 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button 
          type="submit" 
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all font-semibold"
        >
          Buscar
        </button>
      </form>

      {/* Tabla con DataTable */}
      <div className="bg-white shadow-lg rounded-2xl border border-gray-100 overflow-hidden">
        <DataTable
          columns={columns}
          data={clients}
          loading={loading}
          emptyMessage={
            <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-2">
              <FiSearch className="w-12 h-12 text-gray-200" />
              <p>No se encontraron clientes{search ? ` para "${search}"` : ''}</p>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default ClientList;