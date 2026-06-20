// src/components/expenses-sale/ExpenseSaleDashboard.jsx
import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSliders, FiDollarSign, FiCheck, FiMinus } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import expenseSaleService from '../../services/expenseSaleService';
import ExpenseSaleFormModal from './ExpenseSaleFormModal';
import { Loading } from '../ui/Loading';
import { formatMoney } from '../../utils/formatters';

const ExpenseSaleVentaDashboard = () => {
  const [catalog, setCatalog] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Control de Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = await expenseSaleService.getAll();
      // Ordenamos por el campo orden asignado en el backend
      const sortedData = (response.data || []).sort((a, b) => (a.orden || 0) - (b.orden || 0));
      setCatalog(sortedData);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error al cargar el catálogo de gastos y trámites de venta");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (record = null) => {
    setRecordToEdit(record);
    setIsModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`¿Está seguro de eliminar "${name}" del catálogo? (Se realizará un borrado lógico).`)) {
      try {
        await expenseSaleService.delete(id);
        toast.success("Concepto eliminado con éxito del maestro");
        loadData();
      } catch (error) {
        toast.error(error?.response?.data?.message || "No se pudo eliminar el concepto");
      }
    }
  };

  if (isLoading && catalog.length === 0) return <div className="py-20"><Loading /></div>;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto animate-fade-in">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="p-2 bg-blue-100 text-blue-600 rounded-xl"><FiSliders size={18} /></span>
            Catálogo Maestro de Gastos y Trámites de Venta
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Configura conceptos predeterminados, valores de referencia y comportamiento en las órdenes de venta.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="bg-blue-600 text-white text-sm px-4 py-2.5 rounded-lg shadow hover:bg-blue-700 flex items-center gap-1.5 font-semibold transition-all"
        >
          <FiPlus /> Crear Concepto
        </button>
      </div>

      {/* Tabla de Datos */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-700 border-b">
              <tr>
                <th className="px-6 py-3.5 w-16 text-center">Orden</th>
                <th className="px-6 py-3.5">Código</th>
                <th className="px-6 py-3.5">Concepto</th>
                <th className="px-6 py-3.5">Valor Ref.</th>
                <th className="px-6 py-3.5 text-center">Cobro Def.</th>
                <th className="px-6 py-3.5 text-center">Trámite</th>
                <th className="px-6 py-3.5 text-center">Accesorio</th>
                <th className="px-6 py-3.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {catalog.length > 0 ? (
                catalog.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-400 text-center font-bold">
                      {item.orden || '-'}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-blue-600 font-semibold uppercase">
                      {item.codigo}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-800 block text-sm">{item.nombre}</span>
                      {item.descripcion && (
                        <span className="text-xs text-gray-400 block truncate max-w-xs">{item.descripcion}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      ${formatMoney(item.valor_referencia || 0, false)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex p-1 rounded-full ${item.cobro_default === 1 ? 'bg-green-50 text-green-600 border' : 'text-gray-300'}`}>
                        {item.cobro_default === 1 ? <FiCheck size={14} /> : <FiMinus size={14} />}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex p-1 rounded-full ${item.tramite_default === 1 ? 'bg-purple-50 text-purple-600 border' : 'text-gray-300'}`}>
                        {item.tramite_default === 1 ? <FiCheck size={14} /> : <FiMinus size={14} />}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex p-1 rounded-full ${item.es_accesorio === 1 ? 'bg-amber-50 text-amber-600 border' : 'text-gray-300'}`}>
                        {item.es_accesorio === 1 ? <FiCheck size={14} /> : <FiMinus size={14} />}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => handleOpenModal(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar Concepto">
                          <FiEdit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(item.id, item.nombre)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar Concepto">
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-16 text-center text-gray-400 italic">
                    El catálogo maestro está vacío. Comienza registrando un trámite o accesorio.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Reutilizable */}
      <ExpenseSaleFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={loadData}
        recordToEdit={recordToEdit}
      />
    </div>
  );
};

export default ExpenseSaleVentaDashboard;