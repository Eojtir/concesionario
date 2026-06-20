/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { FiX, FiSave } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import expenseCategoryService from '../../../services/expenseCategoryService';

const ExpenseCategoryFormModal = ({ isOpen, onClose, onSaved, categoryToEdit }) => {
  const [formData, setFormData] = useState({
    name: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!categoryToEdit;

  useEffect(() => {
    if (isOpen) {
      if (categoryToEdit) {
        setFormData({
          name: categoryToEdit.name || ''
        });
      } else {
        setFormData({
          name: ''
        });
      }
    }
  }, [isOpen, categoryToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("El nombre de la categoría es obligatorio");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading(isEditMode ? "Actualizando categoría..." : "Guardando nueva categoría...");

    try {
      // Mandamos el payload limpio al backend
      const payload = {
        name: formData.name.trim()
      };

      if (isEditMode) {
        // Usamos .category_id según la respuesta de tu backend
        await expenseCategoryService.update(categoryToEdit.category_id, payload);
        toast.success("Categoría actualizada con éxito", { id: toastId });
      } else {
        await expenseCategoryService.create(payload);
        toast.success("Categoría creada con éxito", { id: toastId });
      }
      
      onSaved();
      onClose();
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error(error.response?.data?.message || "Ocurrió un error en el servidor", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800">
            {isEditMode ? '⚙️ Editar Categoría' : '📂 Nueva Categoría de Gasto'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={isSubmitting}
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Nombre de la Categoría <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: ADMINISTRATIVO, Lavado, Chapa y Pintura..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              maxLength={50}
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 flex items-center gap-2 shadow transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              <FiSave /> {isSubmitting ? 'Guardando...' : 'Guardar Categoría'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseCategoryFormModal;