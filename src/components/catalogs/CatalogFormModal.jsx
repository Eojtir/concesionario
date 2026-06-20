// src/components/catalogs/CatalogFormModal.jsx
import React, { useState, useEffect } from 'react';
import { FiX, FiSave } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import catalogService from '../../services/catalogService';

const CatalogFormModal = ({ isOpen, onClose, entity, recordToEdit, onSaved }) => {
  const [formData, setFormData] = useState({ data: '', status: 1, type: '', id_mark: '' });
  const [parentCatalogs, setParentCatalogs] = useState([]); // Almacena tipos o marcas para los selects dependientes
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Configurar diccionarios de etiquetas según la guía de Scriptcase
  const entityLabels = {
    types: { title: 'Clasificación / Tipo', nameField: 'Nombre del Tipo' },
    marks: { title: 'Marca', nameField: 'Nombre de la Marca' },
    modelos: { title: 'Modelo', nameField: 'Nombre del Modelo' }
  };

  // 2. Cargar catálogos padres si la entidad es una llave foránea (FK)
  useEffect(() => {
    const loadParentData = async () => {
      if (!isOpen) return;
      try {
        if (entity === 'marks') {
          // Las marcas necesitan saber a qué "type" pertenecen
          const res = await catalogService.getAll('types');
          setParentCatalogs(res.data || []);
        } else if (entity === 'modelos') {
          // Los modelos necesitan saber a qué "mark" pertenecen
          const res = await catalogService.getAll('marks');
          setParentCatalogs(res.data || []);
        }
      } catch (err) {
        console.error("Error cargando dependencias del catálogo:", err);
      }
    };
    loadParentData();
  }, [entity, isOpen]);

  // 3. Cargar datos si estamos en modo edición
  useEffect(() => {
    if (recordToEdit && isOpen) {
      setFormData({
        data: recordToEdit.data || '',
        status: recordToEdit.status !== undefined ? recordToEdit.status : 1,
        type: recordToEdit.type || '',
        id_mark: recordToEdit.id_mark || ''
      });
    } else {
      setFormData({ data: '', status: 1, type: '', id_mark: '' });
    }
  }, [recordToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.data.trim()) return toast.error("El nombre es un campo obligatorio");

    // Validar campos relacionales obligatorios
    if (entity === 'marks' && !formData.type) return toast.error("Debe seleccionar un Tipo");
    if (entity === 'modelos' && !formData.id_mark) return toast.error("Debe seleccionar una Marca");

    setIsSubmitting(true);
    const toastId = toast.loading("Guardando cambios...");

    try {
      // Estructurar el Body JSON exacto que exige tu diccionario de Scriptcase
      let payload = {};
      if (entity === 'types') {
        payload = { data: formData.data, status: parseInt(formData.status) };
      } else if (entity === 'marks') {
        payload = { type: parseInt(formData.type), data: formData.data, status: parseInt(formData.status) };
      } else if (entity === 'modelos') {
        payload = { id_mark: parseInt(formData.id_mark), data: formData.data };
      }

      if (recordToEdit) {
        // En edición, extraemos el ID correspondiente según la entidad
        const id = recordToEdit.id || recordToEdit.id_mark || recordToEdit.id_modelo;
        await catalogService.update(entity, id, payload);
        toast.success("Registro actualizado con éxito", { id: toastId });
      } else {
        await catalogService.create(entity, payload);
        toast.success("Registro creado con éxito", { id: toastId });
      }

      onSaved();
      onClose();
    } catch (error) {
      toast.error(error.message || "Error al procesar la solicitud", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentLabel = entityLabels[entity] || { title: 'Catálogo', nameField: 'Descripción' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">
            {recordToEdit ? `Editar ${currentLabel.title}` : `Nuevo ${currentLabel.title}`}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <FiX size={20} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* SELECT PADRE: Si es MARCA (pide Tipo) */}
          {entity === 'marks' && (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Clasificación Superior *</label>
              <select name="type" value={formData.type} onChange={handleChange} className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 text-sm" required>
                <option value="">-- Seleccione un Tipo --</option>
                {parentCatalogs.map(t => <option key={t.id} value={t.id}>{t.data}</option>)}
              </select>
            </div>
          )}

          {/* SELECT PADRE: Si es MODELO (pide Marca) */}
          {entity === 'modelos' && (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Marca Perteneciente *</label>
              <select name="id_mark" value={formData.id_mark} onChange={handleChange} className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 text-sm" required>
                <option value="">-- Seleccione una Marca --</option>
                {parentCatalogs.map(m => <option key={m.id_mark} value={m.id_mark}>{m.data}</option>)}
              </select>
            </div>
          )}

          {/* Nombre/Descripción del registro */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">{currentLabel.nameField} *</label>
            <input type="text" name="data" value={formData.data} onChange={handleChange} placeholder="Ej: Toyota, SUV, Yaris..." className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" required />
          </div>

          {/* Estado: Solo disponible para types y marks (según diccionario de base de datos) */}
          {entity !== 'modelos' && (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Estado Operativo</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 text-sm">
                <option value={1}>🟢 Activo</option>
                <option value={0}>🔴 Inactivo</option>
              </select>
            </div>
          )}

          {/* Footer del Modal */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-sm text-gray-600 bg-white border rounded-lg hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-1.5 shadow">
              <FiSave /> {isSubmitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CatalogFormModal;