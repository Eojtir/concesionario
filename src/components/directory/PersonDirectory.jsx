// src/components/directory/PersonDirectory.jsx
import React, { useState, useEffect } from 'react';
import { FiUsers, FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import personService from '../../services/personService';
import PersonFormModal from './PersonFormModal';
import { Loading } from '../ui/Loading';

const PersonDirectory = () => {
  const [people, setPeople] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Estados para el Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [personToEdit, setPersonToEdit] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = await personService.getAll();
      setPeople(response.data || []);
    } catch (error) {
      toast.error("Error al cargar el directorio");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (person = null) => {
    setPersonToEdit(person);
    setIsModalOpen(true);
  };

  const handleDelete = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar a ${nombre}? Esta acción no se puede deshacer.`)) {
      const toastId = toast.loading("Eliminando registro...");
      try {
        await personService.delete(id);
        toast.success("Registro eliminado", { id: toastId });
        loadData(); // Refresca la tabla
      } catch (error) {
        toast.error("No se pudo eliminar el registro", { id: toastId });
      }
    }
  };

  // Filtro de búsqueda por RUT o Nombre
  const filteredPeople = people.filter(p => 
    p.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.rut.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <Loading />;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto animate-fade-in">
      
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FiUsers className="text-blue-600" /> Directorio de Personas
          </h1>
          <p className="text-gray-500 text-sm mt-1">Administra a tus clientes y proveedores (consignantes).</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-blue-700 flex items-center gap-2 font-medium transition-colors"
        >
          <FiPlus /> Nuevo Registro
        </button>
      </div>

      {/* Barra de Búsqueda y Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder="Buscar por nombre o RUT..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase font-semibold text-xs">
              <tr>
                <th className="px-6 py-4">RUT</th>
                <th className="px-6 py-4">Nombre / Razón Social</th>
                <th className="px-6 py-4">Contacto</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPeople.length > 0 ? (
                filteredPeople.map((p) => (
                  <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-800 whitespace-nowrap">{p.rut}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-800">{p.nombre_completo}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{p.direccion || 'Sin dirección'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p>{p.email || '-'}</p>
                      <p className="text-gray-500">{p.telefono || '-'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {p.es_cliente === 1 && <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Cliente</span>}
                        {p.es_proveedor === 1 && <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Proveedor</span>}
                        {p.es_cliente === 0 && p.es_proveedor === 0 && <span className="text-gray-400 italic text-xs">Sin asignar</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => handleOpenModal(p)} className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors tooltip-wrapper" title="Editar">
                          <FiEdit2 />
                        </button>
                        <button onClick={() => handleDelete(p.id, p.nombre_completo)} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors" title="Eliminar">
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    No se encontraron registros en el directorio.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Renderizado del Modal. Se le pasa el onSaved para que recargue la tabla */}
      <PersonFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSaved={loadData} 
        personToEdit={personToEdit}
      />

    </div>
  );
};

export default PersonDirectory;