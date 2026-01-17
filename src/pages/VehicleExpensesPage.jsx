import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import vehicleService from '../services/vehicleService';
import expenseService from '../services/expenseService';

const VehicleExpensesPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [targetMargin, setTargetMargin] = useState(25); // Margen deseado por defecto (25%)
  
  // Formulario de Gasto
  const [newExpense, setNewExpense] = useState({
    description: '',
    category: 'Mecánica',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  const CATEGORIES = ["Mecánica", "Chapa y Pintura", "Trámites / Papelería", "Limpieza", "Repuestos", "Otros"];

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const vData = await vehicleService.getById(id);
      const eData = await expenseService.getByVehicle(id);
      
      // Ajuste de fecha para que no de error si viene null
      if(vData.entry_date) vData.entry_date = vData.entry_date.split(' ')[0];
      
      setVehicle(vData);
      setExpenses(eData);
    } catch (error) {
      console.error(error);
      alert('Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newExpense.amount || !newExpense.description) return;

    try {
      await expenseService.create({ ...newExpense, vehicle_id: id });
      const eData = await expenseService.getByVehicle(id);
      setExpenses(eData);
      setNewExpense({ ...newExpense, description: '', amount: '' });
    } catch (error) {
      alert('Error al guardar gasto');
    }
  };

  const handleDelete = async (expenseId) => {
    if (window.confirm('¿Eliminar este gasto?')) {
      try {
        await expenseService.delete(expenseId);
        setExpenses(expenses.filter(e => e.id !== expenseId));
      } catch (error) {
        alert('Error eliminando');
      }
    }
  };

  // --- CÁLCULOS FINANCIEROS AVANZADOS ---
  const formatMoney = (val) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(val);

  const purchasePrice = vehicle ? parseFloat(vehicle.purchase_price) || 0 : 0;
  const totalExpensesOnly = expenses.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  
  // Costo Total = Compra + Gastos
  const totalCost = purchasePrice + totalExpensesOnly;
  
  // Ganancia Real Actual (Basada en el precio de venta definido en la ficha)
  const currentSalePrice = vehicle ? parseFloat(vehicle.sale_price) || 0 : 0;
  const currentProfit = currentSalePrice - totalCost;
  const currentMarginPercent = currentSalePrice > 0 ? ((currentProfit / currentSalePrice) * 100).toFixed(1) : 0;

  // Precio Sugerido (Dinámico)
  // Fórmula: Costo / (1 - Margen%) -> Para obtener margen sobre venta
  // Fórmula simple: Costo * (1 + Margen%) -> Para obtener markup sobre costo. Usaremos Markup por simplicidad.
  const suggestedPrice = totalCost * (1 + (targetMargin / 100));

  if (loading) return <div className="p-10 text-center">Cargando...</div>;
  if (!vehicle) return <div className="p-10 text-center text-red-500">Vehículo no encontrado</div>;

  return (
    <div className="max-w-5xl mx-auto p-4">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Hoja de Costos</h1>
          <p className="text-gray-500">{vehicle.make} {vehicle.model} - {vehicle.plate}</p>
        </div>
        <button onClick={() => navigate('/dashboard')} className="text-blue-600 hover:underline">
          &larr; Volver al inventario
        </button>
      </div>

      {/* PANEL DE KPIs E INTELIGENCIA DE PRECIOS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        
        {/* TARJETA 1: COSTO REAL */}
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
          <p className="text-xs text-gray-400 uppercase font-bold">Inversión Total (Costo Real)</p>
          <div className="flex justify-between items-end mt-2">
            <span className="text-2xl font-bold text-gray-800">{formatMoney(totalCost)}</span>
            <span className="text-xs text-gray-500 mb-1">{expenses.length} gastos extras</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
            {/* Barra visual de proporción Compra vs Gastos */}
            <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${(purchasePrice/totalCost)*100}%` }}></div>
          </div>
          <p className="text-xs text-gray-400 mt-1">La barra roja es el precio de compra</p>
        </div>

        {/* TARJETA 2: PRECIO DE VENTA ACTUAL */}
        <div className={`bg-white p-4 rounded-lg shadow border-l-4 ${currentProfit >= 0 ? 'border-green-500' : 'border-orange-500'}`}>
          <p className="text-xs text-gray-400 uppercase font-bold">Precio Venta Actual</p>
          <div className="flex justify-between items-end mt-2">
            <span className="text-2xl font-bold text-gray-800">{formatMoney(currentSalePrice)}</span>
            <span className={`text-sm font-bold px-2 py-0.5 rounded ${currentProfit >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {currentProfit >= 0 ? 'Ganancia' : 'Pérdida'}
            </span>
          </div>
          <p className={`text-sm mt-2 font-medium ${currentProfit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            Neto: {formatMoney(currentProfit)} ({currentMarginPercent}%)
          </p>
        </div>

        {/* TARJETA 3: SUGERENCIA DE PRECIO (NUEVO)
        <div className="bg-blue-50 p-4 rounded-lg shadow border border-blue-200">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs text-blue-800 uppercase font-bold">Calculadora de Precio</p>
            <div className="flex items-center gap-1">
               <span className="text-xs text-blue-600">Margen:</span>
               <input 
                 type="number" 
                 value={targetMargin} 
                 onChange={(e) => setTargetMargin(Number(e.target.value))}
                 className="w-12 h-6 text-xs text-center border rounded"
               />
               <span className="text-xs text-blue-600">%</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-700">{formatMoney(suggestedPrice)}</p>
          <p className="text-xs text-blue-500 mt-1">
            Precio sugerido para ganar un {targetMargin}% sobre el costo total.
          </p>
        </div> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* FORMULARIO */}
        <div className="bg-white rounded-lg shadow p-6 h-fit">
          <h3 className="text-lg font-bold mb-4 text-gray-800">Registrar Nuevo Gasto</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ... (Mismo formulario de antes) ... */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Categoría</label>
              <select 
                value={newExpense.category} 
                onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded p-2 bg-white"
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Descripción</label>
              <input type="text" required placeholder="Ej: Batería nueva"
                value={newExpense.description} 
                onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Monto ($)</label>
              <input type="number" required value={newExpense.amount} 
                onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha</label>
              <input type="date" required value={newExpense.date} 
                onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded p-2"
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-medium">
              + Agregar Gasto
            </button>
          </form>
        </div>

        {/* LISTA DE GASTOS (CON COMPRA INCLUIDA) */}
        <div className="md:col-span-2 bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">Desglose de Costos</h3>
            <span className="text-sm text-gray-500">Ordenado por fecha</span>
          </div>
          
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Concepto</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Monto</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              
              {/* 1. FILA FIJA: PRECIO DE COMPRA (PRIMER GASTO) */}
              <tr className="bg-blue-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-800 font-mono">
                  {vehicle.entry_date || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-blue-900">COMPRA DEL VEHÍCULO</div>
                  <div className="text-xs text-blue-600">Valor original de adquisición</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-blue-900">
                  {formatMoney(purchasePrice)}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-xs text-gray-400 select-none">🔒</span>
                </td>
              </tr>

              {/* 2. FILAS DINÁMICAS: GASTOS EXTRAS */}
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exp.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{exp.description}</div>
                    <div className="text-xs text-gray-500">{exp.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-700">
                    {formatMoney(exp.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleDelete(exp.id)} className="text-red-400 hover:text-red-700 font-bold px-2">
                      &times;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            {/* PIE DE TABLA CON TOTALES */}
            <tfoot className="bg-gray-50 border-t-2 border-gray-200">
              <tr>
                <td colSpan="2" className="px-6 py-3 text-right text-sm font-bold text-gray-700 uppercase">
                  Costo Total Acumulado:
                </td>
                <td className="px-6 py-3 text-right text-lg font-bold text-gray-900">
                  {formatMoney(totalCost)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

      </div>
    </div>
  );
};

export default VehicleExpensesPage;