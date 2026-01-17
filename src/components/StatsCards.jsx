import React, { useMemo } from 'react';

const StatsCards = ({ vehicles }) => {
  
  // Usamos useMemo para que no recalcule en cada render, solo si cambia 'vehicles'
  const stats = useMemo(() => {
    
    // 1. Filtrar solo los que están en stock (Disponibles o Mantenimiento)
    const inStock = vehicles.filter(v => v.status === 'available' || v.status === 'maintenance');
    
    // 2. Calcular Inversión Total (Suma de precios de compra de lo que está en stock)
    const totalInvestment = inStock.reduce((acc, curr) => acc + (parseFloat(curr.purchase_price) || 0), 0);

    // 3. Calcular Ganancia Proyectada (Suma de (Venta - Compra) de lo que está en stock)
    const potentialProfit = inStock.reduce((acc, curr) => {
      const buy = parseFloat(curr.purchase_price) || 0;
      const sell = parseFloat(curr.sale_price) || 0;
      return acc + (sell - buy);
    }, 0);

    return {
      count: inStock.length,
      investment: totalInvestment,
      profit: potentialProfit,
      totalVehicles: vehicles.length // Incluyendo vendidos
    };
  }, [vehicles]);

  // Formateador de moneda (Pesos Chilenos o la moneda que uses)
  const formatMoney = (amount) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      
      {/* TARJETA 1: VEHÍCULOS EN STOCK */}
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm font-medium uppercase">En Stock</p>
            <p className="text-2xl font-bold text-gray-800">{stats.count}</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-full text-blue-600">
            {/* Icono Auto */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">De un total de {stats.totalVehicles} registrados</p>
      </div>

      {/* TARJETA 2: INVERSIÓN TOTAL (Dinero en la calle) */}
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm font-medium uppercase">Capital Invertido</p>
            <p className="text-2xl font-bold text-gray-800">{formatMoney(stats.investment)}</p>
          </div>
          <div className="p-3 bg-yellow-100 rounded-full text-yellow-600">
            {/* Icono Dinero */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">Costo de inventario actual</p>
      </div>

      {/* TARJETA 3: GANANCIA PROYECTADA */}
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm font-medium uppercase">Ganancia Proyectada</p>
            <p className="text-2xl font-bold text-green-600">+{formatMoney(stats.profit)}</p>
          </div>
          <div className="p-3 bg-green-100 rounded-full text-green-600">
            {/* Icono Gráfica */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">Margen esperado si vendes todo</p>
      </div>

    </div>
  );
};

export default StatsCards;