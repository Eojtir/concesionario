// src/components/catalogs/ModelsByMarkModal.jsx
import React, { useState, useEffect } from 'react';
import { FiX, FiPlus, FiTrash2, FiTag } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import catalogService from '../../services/catalogService';
import { Loading } from '../ui/Loading';

const ModelsByMarkModal = ({ isOpen, onClose, mark }) => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newModelName, setNewModelName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Cargar solo los modelos y filtrar en el Frontend los que corresponden a esta marca
  const loadModels = async () => {
    if (!mark) return;
    setLoading(true);
    try {
      const response = await catalogService.getAll('modelos');
      // Filtramos los modelos cuyo id_mark coincida con el de la marca seleccionada
      const filtered = (response.data || []).filter(m => m.id_mark === mark.id_mark);
      setModels(filtered);
    } catch (error) {
      toast.error("Error al cargar los modelos de esta marca");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadModels();
      setNewModelName('');
    }
  }, [isOpen, mark]);

  if (!isOpen || !mark) return null;

  // 2. Agregar un nuevo modelo asociado automáticamente a esta ID_MARK
  const handleAddModel = async (e) => {
    e.preventDefault();
    if (!newModelName.trim()) return toast.error("Escribe el nombre del modelo");

    setIsSubmitting(true);
    try {
      const payload = {
        id_mark: mark.id_mark, // Se asocia automáticamente
        data: newModelName.trim().toUpperCase() // Forzamos mayúsculas para estandarizar
      };

      await catalogService.create('modelos', payload);
      toast.success(`Modelo "${newModelName}" agregado a ${mark.data}`);
      setNewModelName('');
      loadModels(); // Recargar la lista local
    } catch (error) {
      toast.error("No se pudo agregar el modelo");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Eliminar un modelo (Hard Delete según Scriptcase)
  const handleDeleteModel = async (id, name) => {
    if (window.confirm(`¿Estás seguro de eliminar el modelo "${name}"?`)) {
      try {
        await catalogService.delete('modelos', id);
        toast.success("Modelo eliminado");
        loadModels();
      } catch (error) {
        toast.error("No se pudo eliminar el modelo");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">
        
        {/* Cabecera */}
        <div className="flex justify-between items-center p-5 border-b bg-gray-50">
          <div>
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FiTag className="text-blue-600" /> Modelos de {mark.data}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Gestiona las líneas y versiones para esta marca.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <FiX size={20} />
          </button>
        </div>

        {/* Formulario rápido para añadir nuevo modelo */}
        <form onSubmit={handleAddModel} className="p-4 bg-blue-50/50 border-b flex gap-2 items-center">
          <div className="flex-1">
            <input 
              type="text" 
              value={newModelName} 
              onChange={(e) => setNewModelName(e.target.value)}
              placeholder="Ej: TT RS, RAV4, Sail..." 
              className="w-full p-2 text-sm border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 uppercase"
              disabled={isSubmitting}
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1 shadow whitespace-nowrap disabled:opacity-50"
          >
            <FiPlus /> Añadir
          </button>
        </form>

        {/* Lista de Modelos con scroll independiente */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <Loading />
          ) : models.length > 0 ? (
            <div className="divide-y border rounded-xl overflow-hidden bg-white">
              {models.map((model) => (
                <div key={model.id_modelo} className="flex justify-between items-center px-4 py-3 hover:bg-gray-50 transition-colors">
                  <span className="font-medium text-gray-800">{model.data}</span>
                  <button 
                    onClick={() => handleDeleteModel(model.id_modelo, model.data)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Eliminar Modelo"
                  >
                    <FiTrash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 text-sm italic py-8">
              Esta marca aún no tiene modelos registrados. ¡Añade el primero arriba!
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300">
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};

export default ModelsByMarkModal;