import React, { useEffect, useState } from 'react';
import vehicleService from '../services/vehicleService';
import { Link } from 'react-router-dom';
import StatsCards from './StatsCards';
import SaleModal from './SaleModal';

const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para manejar qué vehículo se está vendiendo actualmente (para abrir el modal)
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const data = await vehicleService.getAll();
      setVehicles(data);
    } catch (error) {
      console.error("Error cargando vehículos", error);
    } finally {
      setLoading(false);
    }
  };

  // Manejar eliminación (Soft Delete)
  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este vehículo? Esta acción no se puede deshacer.')) {
      try {
        await vehicleService.delete(id);
        setVehicles(vehicles.filter(vehicle => vehicle.id !== id));
      } catch (error) {
        alert('Error al eliminar: ' + (error.response?.data?.error || 'Error desconocido'));
      }
    }
  };

  // Callback: Se ejecuta cuando el Modal confirma la venta exitosamente
  const handleSaleSuccess = () => {
    loadVehicles(); // Recargamos la lista para que el auto aparezca como 'sold'
    setSelectedVehicle(null); // Cerramos el modal
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando inventario...</div>;

  return (
    <div>
      {/* 1. COMPONENTE DE TARJETAS KPI */}
      <StatsCards vehicles={vehicles} />

      {/* 2. MODAL DE VENTA (Solo se renderiza si hay un auto seleccionado) */}
      {selectedVehicle && (
        <SaleModal 
          vehicle={selectedVehicle} 
          onClose={() => setSelectedVehicle(null)} 
          onSuccess={handleSaleSuccess} 
        />
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden mt-6">
        
        {/* 3. ENCABEZADO CON BOTÓN "NUEVO" */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Inventario Actual</h3>
            <span className="text-sm text-gray-500">{vehicles.length} vehículos registrados</span>
          </div>
          
          <Link 
            to="/vehicles/new" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow flex items-center gap-2 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Nuevo Vehículo
          </Link>
        </div>

        {/* 4. TABLA DE DATOS */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehículo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Año</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Lista</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vehicles.map((car) => (
                <tr key={car.id} className="hover:bg-gray-50 transition-colors">
                  
                  {/* Info Vehículo */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">{car.make} {car.model}</div>
                    <div className="text-xs text-gray-500">VIN: {car.vin}</div>
                  </td>
                  
                  {/* Patente */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-mono font-bold text-gray-600 border border-gray-200">
                        {car.plate}
                    </span>
                  </td>
                  
                  {/* Año */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {car.year}
                  </td>
                  
                  {/* Precio */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-green-700">
                      ${new Intl.NumberFormat('es-CL').format(car.sale_price)}
                    </div>
                  </td>
                  
                  {/* Estado (Badge de color) */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${car.status === 'available' ? 'bg-green-100 text-green-800' : 
                        car.status === 'sold' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {car.status === 'available' ? 'Disponible' : 
                       car.status === 'sold' ? 'Vendido' : car.status}
                    </span>
                  </td>
                  
                  {/* ACCIONES */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    
                    {/* Botón COSTOS (Siempre visible) */}
                    <Link 
                      to={`/vehicles/${car.id}/expenses`} 
                      className="text-gray-500 hover:text-blue-600 font-bold mr-4 inline-flex items-center transition-colors"
                      title="Gestionar Costos y Gastos"
                    >
                      <span className="mr-1 text-lg">$</span>
                    </Link>

                    {/* Lógica Condicional: Si está DISPONIBLE vs VENDIDO */}
                    {car.status === 'available' ? (
                      <>
                        {/* Botón VENDER (Abre el Modal) */}
                        <button
                          onClick={() => setSelectedVehicle(car)}
                          className="bg-green-600 text-white hover:bg-green-700 px-3 py-1 rounded shadow-sm font-bold mr-3 text-xs uppercase tracking-wide transition-colors"
                        >
                          Vender
                        </button>

                        {/* Botón EDITAR */}
                        <Link 
                          to={`/vehicles/edit/${car.id}`} 
                          className="text-indigo-600 hover:text-indigo-900 font-bold mr-3"
                        >
                          Editar
                        </Link>

                        {/* Botón ELIMINAR */}
                        <button 
                          onClick={() => handleDelete(car.id)}
                          className="text-red-400 hover:text-red-700 font-bold text-lg leading-none"
                          title="Eliminar Vehículo"
                        >
                          &times;
                        </button>
                      </>
                    ) : (
                      /* Si ya está vendido, mostramos candado */
                      <span className="text-gray-400 text-xs italic cursor-not-allowed border border-gray-200 px-2 py-1 rounded bg-gray-50">
                        🔒 Cerrado
                      </span>
                    )}

                  </td>
                </tr>
              ))}
              
              {/* Estado vacío */}
              {vehicles.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                    No hay vehículos registrados. ¡Agrega el primero!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VehicleList;