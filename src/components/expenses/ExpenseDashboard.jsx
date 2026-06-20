/* eslint-disable no-unused-vars */
// src/components/expenses/ExpenseDashboard.jsx
import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, FiCalendar } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import expenseService from '../../services/expenseService';
import ExpenseFormModal from './ExpenseFormModal';
import { Loading } from '../ui/Loading';
import { formatMoney } from '../../utils/formatters';
import { formatDate } from '../../utils/formatDate';

const ExpenseDashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Controles del Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  // Cálculo de fechas para el filtro inicial (primer día y último día del mes actual)
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const start_date = `${year}-${month}-01`;
  const lastDayOfMonth = new Date(year, today.getMonth() + 1, 0).getDate();
  const end_date = `${year}-${month}-${lastDayOfMonth}`;




  // Estados de Filtros para la API (fechas)
  const [filters, setFilters] = useState({
    start_date: start_date,
    end_date: end_date
  });

  // Filtro de búsqueda por texto (frontend)
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const result = await expenseService.getAll(filters);
      setExpenses(result.data || result || []);
    } catch (error) {
      toast.error("Error al cargar los gastos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ start_date: "", end_date: "" });
    setSearchQuery("");
  };

  // Filtrado en frontend por búsqueda de texto
  const filteredExpenses = expenses.filter((exp) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase().trim();
    
    // Buscar en vehicle_id (ya contiene marca + modelo + patente)
    const vehicleId = (exp.vehicle_id || "").toLowerCase();
    // Buscar en otros campos del gasto
    const category = (exp.category || "").toLowerCase();
    const description = (exp.description || "").toLowerCase();
    const amount = (exp.amount || "").toString().toLowerCase();
    const date = (exp.date || "").toLowerCase();
    
    return (
      vehicleId.includes(query) ||
      category.includes(query) ||
      description.includes(query) ||
      amount.includes(query) ||
      date.includes(query)
    );
  });

  const handleOpenModal = (expense = null) => {
   
      setExpenseToEdit(expense);
      setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar este gasto permanentemente?`)) {
      const toastId = toast.loading("Eliminando gasto...");
      try {
        await expenseService.delete(id);
        toast.success("Gasto eliminado", { id: toastId });
        loadData();
      } catch (error) {
        toast.error("No se pudo eliminar el gasto", { id: toastId });
      }
    }
  };

  // Cálculo de totales sobre los resultados filtrados
  const totalGastos = filteredExpenses.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

  if (isLoading && expenses.length === 0) return <Loading />;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto animate-fade-in">
      
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span className="bg-red-100 p-2 rounded-lg text-red-600"><FiDollarSign /></span>
            Control de Gastos y Egresos
          </h1>
          <p className="text-gray-500 text-sm mt-1">Administra reparaciones, comisiones y gastos operativos.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="bg-red-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-red-700 flex items-center gap-2 font-medium transition-colors"
        >
          <FiPlus /> Registrar Gasto
        </button>
      </div>

      {/* Tarjeta de Resumen */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-gray-500 font-medium">Total Invertido / Gastado (Según filtros)</h3>
          <p className="text-3xl font-bold text-gray-800">${formatMoney(totalGastos, false)}</p>
        </div>
        
        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative">
            <FiCalendar className="absolute left-3 top-3 text-gray-400" />
            <input 
              type="date" 
              name="start_date" 
              value={filters.start_date} 
              onChange={handleFilterChange} 
              className="pl-9 pr-3 py-2 border rounded-lg text-sm text-gray-600" 
              title="Fecha Inicio" 
            />
          </div>
          <span className="text-gray-400">-</span>
          <div className="relative">
            <FiCalendar className="absolute left-3 top-3 text-gray-400" />
            <input 
              type="date" 
              name="end_date" 
              value={filters.end_date} 
              onChange={handleFilterChange} 
              className="pl-9 pr-3 py-2 border rounded-lg text-sm text-gray-600" 
              title="Fecha Fin" 
            />
          </div>
          
          {/* Input de búsqueda por cualquier dato */}
          <div className="relative w-full md:w-64">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar vehículo, patente, gasto..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="pl-9 pr-3 py-2 border rounded-lg text-sm w-full text-gray-600" 
            />
          </div>
          
          <button 
            onClick={handleClearFilters} 
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
            title="Limpiar Filtros"
          >
            <FiFilter />
          </button>
        </div>
      </div>

      {/* Tabla de Resultados */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase font-semibold text-xs border-b">
              <tr>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Vehículo</th>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4 w-1/3">Descripción</th>
                <th className="px-6 py-4 text-right">Monto</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id || `${exp.vehicle_id}-${exp.date}-${exp.amount}`} className="hover:bg-red-50/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(exp.date?.split(" ")[0])}</td>
                    <td className="px-6 py-4 font-medium">
                      {exp.vehicle_id ? (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{exp.vehicle}</span>
                      ) : (
                        <span className="text-gray-400 text-xs italic">General</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-semibold">{exp.category}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-800">{exp.description}</td>
                    <td className="px-6 py-4 text-right font-bold text-red-600">
                      ${formatMoney(exp.amount, false)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleOpenModal(exp)} className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                          <FiEdit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(exp.expense_id)} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <FiSearch className="text-4xl text-gray-300 mb-3" />
                      <p className="text-lg font-medium">No se encontraron gastos</p>
                      <p className="text-sm">Ajusta los filtros o registra un nuevo gasto.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ExpenseFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSaved={loadData} 
        expenseToEdit={expenseToEdit}
      />
    </div>
  );
};

export default ExpenseDashboard;