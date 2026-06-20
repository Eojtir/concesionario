/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { FiX, FiSave, FiTag, FiFileText, FiDollarSign, FiCalendar, FiTruck } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import expenseService from '../../services/expenseService';
import vehicleService from '../../services/vehicleService'; 
import expenseCategoryService from '../../services/expenseCategoryService'; // 👈 IMPORTAMOS EL NUEVO SERVICIO
import { formatMoney } from '../../utils/formatters';

const initialForm = {
  vehicle_id: '', 
  category: '',
  description: '',
  amount: '',
  expense_date: new Date().toLocaleDateString("en-CA") 
};

const ExpenseFormModal = ({ isOpen, onClose, onSaved, expenseToEdit }) => {
  const [formData, setFormData] = useState(initialForm);
  const [vehicles, setVehicles] = useState([]); 
  const [categories, setCategories] = useState([]); // 👈 ESTADO PARA LAS CATEGORÍAS DINÁMICAS
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(false); 
  const [loadingCategories, setLoadingCategories] = useState(false); // 👈 LOADER INTERNO PARA CATEGORÍAS

  // 1. Cargar catálogo de vehículos y categorías al abrir el Modal
  useEffect(() => {
    const fetchSelectoresData = async () => {
      if (!isOpen) return;
      
      // Cargar Vehículos
      try {
        setLoadingVehicles(true);
        const data = await vehicleService.getAvailable();
        setVehicles(data || []);
      } catch (error) {
        console.error("Error cargando vehículos:", error);
        toast.error("No se pudo cargar la lista de vehículos");
      } finally {
        setLoadingVehicles(false);
      }

      // Cargar Categorías desde el Backend
      try {
        setLoadingCategories(true);
        const response = await expenseCategoryService.getAll();
        // Filtramos para mostrar solo las categorías activas
        const activas = (response.data || response || []).filter(cat => cat.status === 'active');
        setCategories(activas);
      } catch (error) {
        console.error("Error cargando categorías:", error);
        toast.error("No se pudo cargar la lista de categorías");
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchSelectoresData();
  }, [isOpen]);

  // 2. Controlar la carga de datos para edición
  useEffect(() => {
    if (expenseToEdit) {
      setFormData({
        ...expenseToEdit,
        expense_date: expenseToEdit.date.split(" ")[0],
        vehicle_id: expenseToEdit.vehicle_id ? expenseToEdit.vehicle_id.toString() : '',
        category: expenseToEdit.category || ''
      });
    } else {
      setFormData(initialForm);
    }
  }, [expenseToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMoneyChange = (e) => {
    const cleanValue = e.target.value.replace(/\D/g, "");
    setFormData(prev => ({ ...prev, amount: cleanValue === "" ? "" : parseInt(cleanValue, 10) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description || !formData.amount || !formData.expense_date || !formData.category) {
      return toast.error("La fecha, monto, categoría y descripción son obligatorios");
    }

    setIsSubmitting(true);
    const toastId = toast.loading(expenseToEdit ? "Actualizando gasto..." : "Registrando gasto...");

    try {
      const payload = {
        ...formData,
        vehicle_id: formData.vehicle_id ? parseInt(formData.vehicle_id, 10) : null,
        amount: parseFloat(formData.amount)
      };

      if (expenseToEdit) {
        await expenseService.update(expenseToEdit.expense_id, payload);
        toast.success("Gasto actualizado", { id: toastId });
      } else {
        await expenseService.create(payload);
        toast.success("Gasto registrado", { id: toastId });
      }
      
      onSaved();
      onClose();
    } catch (error) {
      toast.error(error.message || "Error al procesar el gasto", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        
        {/* Cabecera */}
        <div className="flex justify-between items-center p-5 border-b bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="bg-red-50 p-1.5 rounded-lg text-red-500"><FiDollarSign /></span> 
            {expenseToEdit ? "Editar Gasto" : "Registrar Nuevo Gasto"}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
            <FiX size={24} />
          </button>
        </div>

        {/* Cuerpo del Formulario */}
        <div className="p-6">
          <form id="expenseForm" onSubmit={handleSubmit} className="space-y-5">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha del Gasto *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FiCalendar className="text-gray-400" /></div>
                  <input type="date" name="expense_date" value={formData.expense_date} onChange={handleChange} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Monto ($) *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FiDollarSign className="text-gray-400" /></div>
                  <input type="text" name="amount" value={formData.amount ? formatMoney(formData.amount, false) : ""} onChange={handleMoneyChange} placeholder="0" className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 font-medium text-gray-800" required />
                </div>
              </div>
            </div>

            {/* 🌟 SELECTOR DINÁMICO DE CATEGORÍAS */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Categoría *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FiTag className="text-gray-400" /></div>
                <select 
                  name="category" 
                  value={formData.category} 
                  onChange={handleChange} 
                  disabled={loadingCategories}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
                >
                  <option value="">-- Selecciona una Categoría --</option>
                  {categories.map((cat) => (
                    <option key={cat.category_id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {loadingCategories ? "Cargando clasificaciones..." : "Asigna un tipo de gasto."}
              </p>
            </div>

            {/* SELECTOR DINÁMICO DE VEHÍCULOS */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Vehículo Asociado</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FiTruck className="text-gray-400" /></div>
                <select 
                  name="vehicle_id" 
                  value={formData.vehicle_id} 
                  onChange={handleChange} 
                  disabled={loadingVehicles}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">-- Gasto General de la Empresa (Ningún Auto) --</option>
                  {vehicles.map((car) => (
                    <option key={car.id} value={car.id}>
                      {car.make} {car.model} ({car.year}) — {car.plate || 'Sin Patente'}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {loadingVehicles ? "Cargando catálogo..." : "Selecciona el auto."}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción / Detalle *</label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none"><FiFileText className="text-gray-400" /></div>
                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Ej: Cambio de pastillas de freno delanteras..." rows="3" className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 resize-none" required></textarea>
              </div>
            </div>

          </form>
        </div>

        {/* Botones de acción */}
        <div className="p-5 border-t bg-gray-50 flex justify-end gap-3">
          <button type="button" onClick={onClose} disabled={isSubmitting} className="px-5 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
            Cancelar
          </button>
          <button type="submit" form="expenseForm" disabled={isSubmitting} className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg hover:from-red-600 shadow-md flex items-center gap-2 disabled:opacity-70">
            {isSubmitting ? "Procesando..." : <><FiSave /> {expenseToEdit ? "Actualizar" : "Registrar Gasto"}</>}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ExpenseFormModal;