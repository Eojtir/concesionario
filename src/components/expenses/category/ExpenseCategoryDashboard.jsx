/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { FiTag, FiPlus, FiEdit2, FiTrash2, FiSearch, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import expenseCategoryService from '../../../services/expenseCategoryService';
import ExpenseCategoryFormModal from './ExpenseCategoryFormModal';
import { Loading } from '../../ui/Loading';
import { formatDate } from '../../../utils/formatDate'; // Usamos tu formateador de fechas

const ExpenseCategoryDashboard = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Controles del Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);

  // Filtro de búsqueda por texto (frontend)
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = await expenseCategoryService.getAll();
      // Como tu JSON tiene { success: true, data: [...] }, extraemos response.data
      console.log("Respuesta del servicio de categorías:", response.data);
      setCategories(response.data || response || []);
    } catch (error) {
      toast.error("Error al cargar las categorías de gastos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtrado en frontend por búsqueda de texto
  const filteredCategories = categories.filter((cat) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase().trim();
    
    const name = (cat.name || "").toLowerCase();
    const status = (cat.status || "").toLowerCase();
    const id = (cat.category_id || "").toString();
    
    return (
      name.includes(query) ||
      status.includes(query) ||
      id.includes(query)
    );
  });

  const handleOpenModal = (category = null) => {
    setCategoryToEdit(category);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar esta categoría?`)) {
      const toastId = toast.loading("Eliminando categoría...");
      try {
        await expenseCategoryService.delete(id);
        toast.success("Categoría eliminada con éxito", { id: toastId });
        loadData();
      } catch (error) {
        toast.error("No se pudo eliminar la categoría", { id: toastId });
      }
    }
  };

  if (isLoading && categories.length === 0) return <Loading />;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto animate-fade-in">
      
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span className="bg-purple-100 p-2 rounded-lg text-purple-600"><FiTag /></span>
            Categorías de Gastos
          </h1>
          <p className="text-gray-500 text-sm mt-1">Configura las clasificaciones para tus egresos y reparaciones operativas.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="bg-purple-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-purple-700 flex items-center gap-2 font-medium transition-colors"
        >
          <FiPlus /> Nueva Categoría
        </button>
      </div>

      {/* Barra de Búsqueda */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-gray-500 font-medium">Categorías Registradas</h3>
          <p className="text-3xl font-bold text-gray-800">{filteredCategories.length}</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar por nombre o ID..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="pl-9 pr-3 py-2 border rounded-lg text-sm w-full text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500" 
          />
        </div>
      </div>

      {/* Tabla de Resultados */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase font-semibold text-xs border-b">
              <tr>
                {/* <th className="px-6 py-4 w-20">ID</th> */}
                <th className="px-6 py-4">Nombre / Etiqueta</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Fecha Creación</th>
                <th className="px-6 py-4 text-center w-32">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((cat) => (
                  <tr key={cat.category_id} className="hover:bg-purple-50/20 transition-colors">
                    {/* <td className="px-6 py-4 font-mono text-xs text-gray-400">#{cat.category_id}</td> */}
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      <span className="bg-purple-50 text-purple-700 px-2.5 py-1 rounded-md text-xs border border-purple-100 uppercase">
                        {cat.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                        cat.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        <FiCheckCircle size={12} /> {cat.status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      {formatDate(cat.created_at?.split(" ")[0])}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleOpenModal(cat)} 
                          className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                          title="Editar categoría"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(cat.category_id)} 
                          className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                          title="Eliminar categoría"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <FiSearch className="text-4xl text-gray-300 mb-3" />
                      <p className="text-lg font-medium">No se encontraron categorías</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Formulario */}
      <ExpenseCategoryFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSaved={loadData} 
        categoryToEdit={categoryToEdit}
      />
    </div>
  );
};

export default ExpenseCategoryDashboard;