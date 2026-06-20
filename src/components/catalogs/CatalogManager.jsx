// src/components/catalogs/CatalogManager.jsx
import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiLayers, FiBookmark, FiCpu, FiEye } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import catalogService from '../../services/catalogService';
import CatalogFormModal from './CatalogFormModal';
import ModelsByMarkModal from './ModelsByMarkModal'; // 👈 NUEVO IMPORT
import { Loading } from '../ui/Loading';

const CatalogManager = () => {
  const [activeEntity, setActiveEntity] = useState('types'); // 'types' o 'marks'
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Controladores de Modales
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState(null);
  
  // Estados para el visor de modelos contextual
  const [selectedMark, setSelectedMark] = useState(null);
  const [isModelsModalOpen, setIsModelsModalOpen] = useState(false);

  const loadCatalog = async () => {
    setLoading(true);
    try {
      const response = await catalogService.getAll(activeEntity);
      setRecords(response.data || []);
    } catch (error) {
      toast.error(`Error al sincronizar el catálogo`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, [activeEntity]);

  const handleOpenForm = (record = null) => {
    setRecordToEdit(record);
    setIsFormOpen(true);
  };

  const handleOpenModels = (mark) => {
    setSelectedMark(mark);
    setIsModelsModalOpen(true);
  };

  const handleDelete = async (record) => {
    const id = record.id || record.id_mark;
    if (window.confirm(`¿Está seguro de eliminar "${record.data}"?`)) {
      try {
        await catalogService.delete(activeEntity, id);
        toast.success("Registro eliminado con éxito");
        loadCatalog();
      } catch (error) {
        toast.error("Ocurrió un error al eliminar");
      }
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto animate-fade-in">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FiLayers className="text-blue-600" /> Tablas Maestras de Catálogos
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Control relacional de la clasificación de tu inventario.</p>
        </div>
        <button 
          onClick={() => handleOpenForm()} 
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg shadow hover:bg-blue-700 flex items-center gap-1.5 font-semibold"
        >
          <FiPlus /> Agregar {activeEntity === 'types' ? 'Tipo' : 'Marca'}
        </button>
      </div>

      {/* Pestañas: Ahora solo quedan 2 */}
      <div className="flex border-b border-gray-200 mb-6 bg-white p-1 rounded-t-xl gap-2">
        <button 
          onClick={() => setActiveEntity('types')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeEntity === 'types' ? 'bg-blue-50 text-blue-600 shadow-sm border font-semibold' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
        >
          <FiCpu /> 1. Tipos de Vehículo
        </button>
        <button 
          onClick={() => setActiveEntity('marks')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeEntity === 'marks' ? 'bg-blue-50 text-blue-600 shadow-sm border font-semibold' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
        >
          <FiBookmark /> 2. Marcas y Modelos
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="py-20"><Loading /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-700 border-b">
                <tr>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Nombre</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.length > 0 ? (
                  records.map((rec) => {
                    const currentId = rec.id || rec.id_mark;
                    return (
                      <tr key={currentId} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs text-gray-400">#{currentId}</td>
                        <td className="px-6 py-4 font-semibold text-gray-800">{rec.data}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${rec.status === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {rec.status === 1 ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {/* 🌟 BOTÓN DINÁMICO: Si es marca, muestra la opción de ver sus modelos */}
                            {activeEntity === 'marks' && (
                              <button 
                                onClick={() => handleOpenModels(rec)}
                                className="flex items-center gap-1 px-2.5 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-blue-600 hover:text-white font-medium transition-colors"
                              >
                                <FiEye size={13} /> Modelos
                              </button>
                            )}
                            <button onClick={() => handleOpenForm(rec)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Editar">
                              <FiEdit2 size={15} />
                            </button>
                            <button onClick={() => handleDelete(rec)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Eliminar">
                              <FiTrash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-400 italic">
                      No hay registros cargados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Formularios para Tipos y Marcas */}
      <CatalogFormModal 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        entity={activeEntity}
        recordToEdit={recordToEdit}
        onSaved={loadCatalog}
      />

      {/* 🌟 NUEVO VISOR CONTEXTUAL DE MODELOS */}
      <ModelsByMarkModal 
        isOpen={isModelsModalOpen}
        onClose={() => setIsModelsModalOpen(false)}
        mark={selectedMark}
      />
    </div>
  );
};

export default CatalogManager;