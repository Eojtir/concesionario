/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import vehicleService from '../services/vehicleService';
import expenseService from '../services/expenseService';
import expenseCategoryService from '../services/expenseCategoryService'; 
import { formatMoney } from '../utils/formatters';
import { formatDate } from '../utils/formatDate';

// Componente de Notificación
const Notification = ({ type, message, show, onClose }) => {
 
  if (!show || !message) return null;
  const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500';
  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white p-4 rounded-lg shadow-lg z-50 flex items-center gap-3 max-w-md`}>
      <span className="text-sm">{message}</span>
      <button onClick={onClose} className="text-white hover:text-gray-200 font-bold text-xl ml-2">&times;</button>
    </div>
  );
};

const VehicleExpensesPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estados de datos
  const [vehicle, setVehicle] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]); 
  
  // Estados de UI
  const [loading, setLoading] = useState({ page: true, action: null });
  const [notification, setNotification] = useState({ type: '', message: '', show: false });
  const [errors, setErrors] = useState({});
  const [targetMargin, setTargetMargin] = useState(25);
  
  // Formulario
  const [newExpense, setNewExpense] = useState({
    description: '',
    category: '', 
    amount: '',
    date: new Date().toLocaleDateString('en-CA')
  });

  // Helper: Mostrar notificación
const showNotification = useCallback((type, message) => {
  setNotification({ type, message, show: true });
  setTimeout(() => setNotification({ type: '', message: '', show: false }), 5000);
}, []);

  // Helper: Normalizar fecha
  const normalizeDate = (dateStr) => {
    if (!dateStr) return null;
    return dateStr.includes(' ') ? dateStr.split(' ')[0] : dateStr;
  };

  // Función dedicada a refrescar UNICAMENTE los gastos desde el backend
  const refreshExpenses = useCallback(async () => {
    try {
      const eResponse = await expenseService.getAll({ vehicle_id: id });
      const expensesData = eResponse?.data;
      
      if (Array.isArray(expensesData)) {
        setExpenses(expensesData);
      } else if (Array.isArray(eResponse)) {
        setExpenses(eResponse);
      } else {
        setExpenses([]);
      }
    } catch (error) {
      console.error('Error recargando gastos:', error);
      showNotification('error', 'Error al actualizar la lista de gastos');
    }
  }, [id, showNotification]);

  // Cargar datos iniciales del vehículo y categorías
  const loadData = useCallback(async () => {
    setLoading(prev => ({ ...prev, page: true }));
    try {
      const [vResponse, cResponse] = await Promise.all([
        vehicleService.getById(id),
        expenseCategoryService.getAll() 
      ]);
      
      // Procesar vehículo
      const vehicleData = vResponse;
      if (!vehicleData || !vehicleData.id) {
        throw new Error('Vehículo no encontrado en el servidor');
      }
      vehicleData.entry_date = normalizeDate(vehicleData.entry_date);
      setVehicle(vehicleData);
      
      // Procesar y filtrar categorías activas
      const catsData = cResponse?.data || cResponse || [];
      const activeCats = catsData.filter(cat => cat.status === 'active');
      setCategories(activeCats);

      if (activeCats.length > 0) {
        setNewExpense(prev => ({ ...prev, category: activeCats[0].name }));
      }

      // Cargar los gastos por primera vez
      await refreshExpenses();
      
    } catch (error) {
      console.error('Error cargando datos:', error);
      showNotification('error', error.message || 'Error al cargar los datos de la página');
    } finally {
      setLoading(prev => ({ ...prev, page: false }));
    }
  }, [id, showNotification, refreshExpenses]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // VALIDACIÓN DEL FORMULARIO
  const validateExpense = useCallback(() => {
    const newErrors = {};
    
    if (!newExpense.description || newExpense.description.trim().length < 3) {
      newErrors.description = 'Descripción obligatoria (mín. 3 caracteres)';
    }

    if (!newExpense.category) {
      newErrors.category = 'Debes seleccionar una categoría';
    }
    
    const amount = parseFloat(newExpense.amount);
    if (isNaN(amount) || amount === null || amount === undefined) {
      newErrors.amount = 'El monto debe ser un número válido';
    } else if (amount <= 0) {
      newErrors.amount = 'El monto debe ser mayor a 0';
    } else if (amount > 999999999) {
      newErrors.amount = 'El monto parece excesivamente alto';
    }
    
    if (!newExpense.date) {
      newErrors.date = 'La fecha es obligatoria';
    } else {
      const date = new Date(newExpense.date);
      if (isNaN(date.getTime())) {
        newErrors.date = 'Fecha inválida';
      } else if (date > new Date()) {
        newErrors.date = 'La fecha no puede ser futura';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [newExpense]);

  // MANEJAR AGREGAR GASTO (CON RECARGA REAL)
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateExpense()) {
      showNotification('error', 'Por favor corrige los errores del formulario');
      return;
    }

    const expenseData = {
      ...newExpense,
      vehicle_id: id,
      amount: parseFloat(newExpense.amount)
    };

    setLoading(prev => ({ ...prev, action: 'add' }));
    
    try {
      // 1. Enviamos el nuevo gasto al backend
      await expenseService.create(expenseData);
      
      // 2. 🚀 RECARGA FORZADA: Traemos los datos frescos y reales desde el servidor
      await refreshExpenses();
      
      // 3. Reset del formulario restableciendo la primera categoría de la lista
      setNewExpense({
        description: '',
        category: categories[0]?.name || '', 
        amount: '',
        date: new Date().toLocaleDateString('en-CA')
      });
      setErrors({});
      showNotification('success', 'Gasto agregado correctamente');
      
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al guardar el gasto';
      showNotification('error', message);
    } finally {
      setLoading(prev => ({ ...prev, action: null }));
    }
  }, [newExpense, id, validateExpense, showNotification, refreshExpenses, categories]);

  // MANEJAR ELIMINACIÓN (CON RECARGA REAL)
  const handleDelete = useCallback(async (expenseId) => {
    const confirmDelete = window.confirm('¿Eliminar este gasto? Esta acción no se puede deshacer.');
    if (!confirmDelete) return;

    setLoading(prev => ({ ...prev, action: 'delete' }));
    
    try {
      // 1. Solicitamos la eliminación al backend
      await expenseService.delete(expenseId);
      
      // 2. 🚀 RECARGA FORZADA: Volvemos a pedir la lista limpia al servidor
      await refreshExpenses();
      
      showNotification('success', 'Gasto eliminado correctamente');
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al eliminar el gasto';
      showNotification('error', message);
    } finally {
      setLoading(prev => ({ ...prev, action: null }));
    }
  }, [showNotification, refreshExpenses]);

  // ORDENAMIENTO POR FECHA DESCENDENTE
  const sortedExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA;
    });
  }, [expenses]);

  // CÁLCULOS FINANCIEROS
  const financials = useMemo(() => {
    if (!vehicle) return null;
    
    const purchasePrice = parseFloat(vehicle.purchase_price) || 0;
    const totalExpensesOnly = expenses.reduce((sum, item) => {
      const amount = parseFloat(item.amount) || 0;
      return sum + amount;
    }, 0);
    
    const totalCost = purchasePrice + totalExpensesOnly;
    const currentSalePrice = parseFloat(vehicle.sale_price) || 0;
    const currentProfit = currentSalePrice - totalCost;
    
    const currentMarginPercent = currentSalePrice > 0 ? ((currentProfit / currentSalePrice) * 100) : 0;
    const targetMarginDecimal = targetMargin / 100;
    const suggestedPrice = totalCost / (1 - targetMarginDecimal);
    
    const categoryPercentages = expenses.reduce((acc, exp) => {
      const category = exp.category || 'Otros';
      const amount = parseFloat(exp.amount) || 0;
      acc[category] = (acc[category] || 0) + amount;
      return acc;
    }, {});

    return {
      purchasePrice,
      totalExpensesOnly,
      totalCost,
      currentSalePrice,
      currentProfit,
      currentMarginPercent: currentMarginPercent.toFixed(1),
      suggestedPrice: Math.round(suggestedPrice),
      categoryPercentages
    };
  }, [vehicle, expenses, targetMargin]);

  if (loading.page) return <div className="min-h-screen flex items-center justify-center">Cargando datos de la hoja de costos...</div>;
  if (!vehicle) return <div className="min-h-screen flex items-center justify-center text-red-500">Vehículo no encontrado</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
    <Notification 
      type={notification.type} 
      message={notification.message} 
      show={notification.show} 
      onClose={() => setNotification({ type: '', message: '', show: false })} 
    />
      
      <div className="max-w-6xl mx-auto px-4">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hoja de Costos</h1>
            <p className="text-gray-600 mt-1">
              {vehicle.year} {vehicle.make} {vehicle.model} - Patente: {vehicle.plate}
            </p>
            <span className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-medium ${
              vehicle.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {vehicle.status === 'available' ? 'Disponible' : 'Vendido'}
            </span>
          </div>
          <button 
            onClick={() => navigate('/vehicles')} 
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <span>&larr;</span> Volver al inventario
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <p className="text-xs text-gray-500 uppercase font-bold">Gastos Extras Totales</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{formatMoney(financials.totalExpensesOnly)}</p>
            <p className="text-xs text-gray-400 mt-1">{expenses.length} gastos registrados</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
            <p className="text-xs text-gray-500 uppercase font-bold">Inversión Total</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{formatMoney(financials.totalCost)}</p>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Precio Compra</span>
                <span>{financials.totalCost > 0 ? ((financials.purchasePrice/financials.totalCost)*100).toFixed(0) : 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: `${financials.totalCost > 0 ? (financials.purchasePrice/financials.totalCost)*100 : 0}%` }}></div>
              </div>
            </div>
          </div>

          <div className={`bg-white p-6 rounded-xl shadow-sm border-2 ${financials.currentProfit >= 0 ? 'border-green-500' : 'border-red-500'}`}>
            <p className="text-xs text-gray-500 uppercase font-bold">Precio Venta Actual</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{formatMoney(financials.currentSalePrice)}</p>
            <p className={`text-sm mt-2 font-medium ${financials.currentProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {financials.currentProfit >= 0 ? 'Ganancia' : 'Pérdida'}: {formatMoney(Math.abs(financials.currentProfit))}
            </p>
            <p className={`text-xs mt-1 font-bold ${financials.currentProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Margen: {financials.currentMarginPercent}%
            </p>
          </div>
        </div>

        {/* Resumen por Categoría */}
        {Object.keys(financials.categoryPercentages).length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Distribución de Gastos por Categoría</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(financials.categoryPercentages).map(([category, total]) => {
                const percentage = financials.totalExpensesOnly > 0 ? ((total / financials.totalExpensesOnly) * 100).toFixed(1) : 0;
                return (
                  <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 uppercase text-xs tracking-wider">{category}</span>
                    <div className="text-right">
                      <span className="block text-sm font-bold text-gray-900">{formatMoney(total)}</span>
                      <span className="text-xs text-gray-500">{percentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Formulario */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Registrar Nuevo Gasto</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                <select 
                  value={newExpense.category} 
                  onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                  className={`mt-1 block w-full border rounded-lg p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors
                    ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
                  disabled={loading.action === 'add' || categories.length === 0}
                  required
                >
                  {categories.length === 0 ? (
                    <option value="">Cargando categorías...</option>
                  ) : (
                    categories.map(cat => (
                      <option key={cat.category_id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))
                  )}
                </select>
                {errors.category && <p className="text-xs text-red-500 mt-1 font-medium">{errors.category}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
                <input type="text" required
                  value={newExpense.description} 
                  onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                  className={`mt-1 block w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors
                    ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Ej: Batería nueva"
                  disabled={loading.action === 'add'}
                />
                {errors.description && <p className="text-xs text-red-500 mt-1 font-medium">{errors.description}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto ($) *</label>
                <input type="number" required min="1" step="any"
                  value={newExpense.amount} 
                  onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  className={`mt-1 block w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors
                    ${errors.amount ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="0"
                  disabled={loading.action === 'add'}
                />
                {errors.amount && <p className="text-xs text-red-500 mt-1 font-medium">{errors.amount}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
                <input type="date" required
                  value={newExpense.date} 
                  onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                  className={`mt-1 block w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors
                    ${errors.date ? 'border-red-500' : 'border-gray-300'}`}
                  disabled={loading.action === 'add'}
                />
                {errors.date && <p className="text-xs text-red-500 mt-1 font-medium">{errors.date}</p>}
              </div>
              
              <button 
                type="submit" 
                disabled={loading.action === 'add' || categories.length === 0}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium transition-all duration-200 disabled:bg-blue-400 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {loading.action === 'add' ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </>
                ) : '+ Agregar Gasto'}
              </button>
            </form>
          </div>

          {/* Lista de Gastos */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Desglose de Costos</h3>
              <span className="text-sm text-gray-500">{expenses.length + 1} ítems</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Concepto</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                    <th className="px-6 py-3 w-20"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  
                  {/* Fila fija: Precio de Compra */}
                  <tr className="bg-blue-50 hover:bg-blue-100 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-900">
                      {formatDate(vehicle.entry_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-blue-900">PRECIO DE COMPRA</div>
                      <div className="text-xs text-blue-600">Valor de adquisición</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-blue-900">
                      {formatMoney(financials.purchasePrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-gray-400 cursor-not-allowed">
                      <svg className="w-4 h-4 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </td>
                  </tr>

                  {/* Filas dinámicas: Gastos */}
                  {sortedExpenses.map((exp) => (
                    <tr key={exp.expense_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(exp.date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{exp.description}</div>
                        <div className="text-xs text-purple-600 font-semibold uppercase tracking-wide">{exp.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                        {formatMoney(exp.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button 
                          onClick={() => handleDelete(exp.expense_id)} 
                          disabled={loading.action === 'delete'}
                          className="text-red-400 hover:text-red-600 font-bold px-2 py-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                          title="Eliminar gasto"
                        >
                          {loading.action === 'delete' ? '...' : '×'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                  <tr>
                    <td colSpan="2" className="px-6 py-4 text-right text-sm font-bold text-gray-700 uppercase">
                      Costo Total de Inversión:
                    </td>
                    <td className="px-6 py-4 text-right text-xl font-bold text-gray-900">
                      {formatMoney(financials.totalCost)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleExpensesPage;