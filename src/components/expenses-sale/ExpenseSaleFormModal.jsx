// src/components/expenses-sale/ExpenseSaleFormModal.jsx
import React, { useState, useEffect } from 'react';
import { FiX, FiSave, FiHash, FiFileText, FiDollarSign, FiSliders } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import expenseSaleService from '../../services/expenseSaleService';


const initialForm = {
  codigo: '',
  nombre: '',
  descripcion: '',
  valor_reference: '', // Usaremos el formateador de dinero para la UI
  cobro_default: 0,
  tramite_default: 0,
  es_accesorio: 0,
  orden: 1
};

const ExpenseSaleFormModal = ({ isOpen, onClose, onSaved, recordToEdit }) => {
  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (recordToEdit && isOpen) {
      setFormData({
        codigo: recordToEdit.codigo || '',
        nombre: recordToEdit.nombre || '',
        descripcion: recordToEdit.descripcion || '',
        valor_referencia: recordToEdit.valor_referencia || '',
        cobro_default: recordToEdit.cobro_default || 0,
        tramite_default: recordToEdit.tramite_default || 0,
        es_accesorio: recordToEdit.es_accesorio || 0,
        orden: recordToEdit.orden || 1
      });
    } else {
      setFormData(initialForm);
    }
  }, [recordToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Si es un checkbox/toggle, guardamos 1 o 0
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked ? 1 : 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.codigo.trim() || !formData.nombre.trim()) {
      return toast.error("El código y el nombre son campos requeridos");
    }

    setIsSubmitting(true);
    const toastId = toast.loading(recordToEdit ? "Actualizando concepto..." : "Creando concepto...");

    try {
      const payload = {
        ...formData,
        valor_referencia: formData.valor_referencia ? parseFloat(formData.valor_referencia) : 0,
        orden: formData.orden ? parseInt(formData.orden, 10) : 1
      };

      if (recordToEdit) {
        await expenseSaleService.update(recordToEdit.id, payload);
        toast.success("Concepto actualizado correctamente", { id: toastId });
      } else {
        await expenseSaleService.create(payload);
        toast.success("Concepto creado exitosamente", { id: toastId });
      }

      onSaved();
      onClose();
    } catch (error) {
      toast.error(error.message || "Error al procesar la solicitud", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        
        {/* Cabecera */}
        <div className="flex justify-between items-center p-5 border-b bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FiSliders className="text-blue-600" />
            {recordToEdit ? "Editar Concepto Maestro" : "Nuevo Concepto de Gasto/Venta"}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
            <FiX size={20} />
          </button>
        </div>

        {/* Formulario */}
        <div className="p-6 overflow-y-auto max-h-[75vh]">
          <form id="expenseSaleForm" onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Código *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FiHash className="text-gray-400" /></div>
                  <input type="text" name="codigo" value={formData.codigo} onChange={handleChange} placeholder="EX-01" className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 uppercase font-mono" required />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nombre del Concepto *</label>
                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Ej: Inscripción y Patente" className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500" required />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Valor Referencial ($)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FiDollarSign className="text-gray-400" /></div>
                  <input type="number" step="0.01" name="valor_referencia" value={formData.valor_referencia} onChange={handleChange} placeholder="0.00" className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 font-medium" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Orden Visual</label>
                <input type="number" name="orden" value={formData.orden} onChange={handleChange} placeholder="1" min="1" className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Descripción Breve</label>
              <div className="relative">
                <div className="absolute top-2.5 left-3 pointer-events-none"><FiFileText className="text-gray-400" /></div>
                <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} placeholder="Opcional: Detalles del trámite o accesorio..." rows="2" className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
              </div>
            </div>

            {/* Flags de Configuración de Comportamiento */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3 mt-2">
              <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Configuración por Defecto</span>
              
              <label className="flex items-center justify-between cursor-pointer py-1 select-none">
                <div>
                  <span className="text-sm font-semibold text-gray-800 block">Cobro por Defecto</span>
                  <span className="text-xs text-gray-500">Se pre-seleccionará para cobrar al cliente en la venta.</span>
                </div>
                <input type="checkbox" name="cobro_default" checked={formData.cobro_default === 1} onChange={handleChange} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" />
              </label>

              <label className="flex items-center justify-between cursor-pointer py-1 border-t select-none pt-2">
                <div>
                  <span className="text-sm font-semibold text-gray-800 block">Requiere Trámite Notarial/Legal</span>
                  <span className="text-xs text-gray-500">Identifica si este concepto pasa al flujo de gestoría.</span>
                </div>
                <input type="checkbox" name="tramite_default" checked={formData.tramite_default === 1} onChange={handleChange} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" />
              </label>

              <label className="flex items-center justify-between cursor-pointer py-1 border-t select-none pt-2">
                <div>
                  <span className="text-sm font-semibold text-gray-800 block">Es Accesorio Vehicular</span>
                  <span className="text-xs text-gray-500">Clasifica el ítem como un añadido físico al vehículo.</span>
                </div>
                <input type="checkbox" name="es_accesorio" checked={formData.es_accesorio === 1} onChange={handleChange} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" />
              </label>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t flex justify-end gap-2">
          <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-sm text-gray-600 bg-white border rounded-lg hover:bg-gray-50">
            Cancelar
          </button>
          <button type="submit" form="expenseSaleForm" disabled={isSubmitting} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow">
            <FiSave /> {isSubmitting ? 'Guardando...' : 'Guardar Concepto'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ExpenseSaleFormModal;