import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import clientService from '../../services/clientService';

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchClients = async (query = '') => {
    setLoading(true);
    try {
      const data = await clientService.getAll(query);
      setClients(data);
    } catch (error) {
      console.error("Error fetching clients", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Manejador de búsqueda simple
  const handleSearch = (e) => {
    e.preventDefault();
    fetchClients(search);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Cartera de Clientes</h1>
        <Link to="/clients/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + Nuevo Cliente
        </Link>
      </div>

      {/* Buscador */}
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input 
          type="text" 
          placeholder="Buscar por Nombre o RUT..." 
          className="border p-2 rounded w-full max-w-md"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Buscar</button>
      </form>

      {/* Tabla */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RUT</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contacto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ciudad</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="5" className="p-4 text-center">Cargando...</td></tr>
            ) : clients.length === 0 ? (
              <tr><td colSpan="5" className="p-4 text-center text-gray-500">No se encontraron clientes</td></tr>
            ) : (
              clients.map(client => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{client.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{client.rut}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    <div className="text-sm">{client.phone}</div>
                    <div className="text-xs text-blue-500">{client.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{client.city}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/clients/edit/${client.id}`} className="text-indigo-600 hover:text-indigo-900">Editar</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientList;