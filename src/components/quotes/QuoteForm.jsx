import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import clientService from '../../services/clientService';
import vehicleService from '../../services/vehicleService';
import quoteService from '../../services/quoteService';

const QuoteForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Listas para los Selects
  const [clients, setClients] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  // Formulario
  const [formData, setFormData] = useState({
    client_id: '',
    vehicle_id: '',
    price: '',
    date: new Date().toISOString().split('T')[0],
    valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 días validez
    notes: ''
  });

  useEffect(() => {
    loadDependencies();
  }, []);

  const loadDependencies = async () => {
    try {
      // Cargamos clientes y vehículos disponibles en paralelo
      const [clientsData, vehiclesData] = await Promise.all([
        clientService.getAll(),
        vehicleService.getAvailable() // Solo autos disponibles
      ]);
      setClients(clientsData || []);
      setVehicles(vehiclesData || []);
    } catch (error) {
      console.error("Error cargando listas", error);
    }
  };

  // Al seleccionar un auto, autocompletar el precio sugerido
  const handleVehicleChange = (e) => {
    const vId = e.target.value;
    const selectedCar = vehicles.find(v => v.id.toString() === vId);
    
    setFormData(prev => ({
        ...prev,
        vehicle_id: vId,
        price: selectedCar ? selectedCar.sale_price : '' // Autocompletar precio
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await quoteService.create(formData);
      // Aquí redirigiremos a la vista previa del PDF o a la lista
      alert('Cotización creada N° ' + res.id);
      navigate('/quotes');
    } catch (error) {
      alert('Error creando cotización');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Nueva Cotización Formal</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Selección de Cliente */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                <select 
                    required 
                    className="w-full border border-gray-300 rounded p-2"
                    value={formData.client_id}
                    onChange={(e) => setFormData({...formData, client_id: e.target.value})}
                >
                    <option value="">-- Seleccionar Cliente --</option>
                    {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.rut})</option>
                    ))}
                </select>
                <div className="mt-1 text-xs text-blue-600 text-right">
                    <a href="/clients/new" target="_blank">+ Crear nuevo cliente</a>
                </div>
            </div>

            {/* Selección de Vehículo */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehículo de Interés</label>
                <select 
                    required 
                    className="w-full border border-gray-300 rounded p-2"
                    value={formData.vehicle_id}
                    onChange={handleVehicleChange}
                >
                    <option value="">-- Seleccionar Vehículo --</option>
                    {vehicles.map(v => (
                        <option key={v.id} value={v.id}>{v.make} {v.model} - {v.plate}</option>
                    ))}
                </select>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Precio */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio Ofertado ($)</label>
                <input 
                    type="number" required 
                    className="w-full border border-gray-300 rounded p-2 font-bold text-gray-800"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                />
            </div>
            
            {/* Fechas */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Emisión</label>
                <input type="date" required className="w-full border border-gray-300 rounded p-2"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Válido Hasta</label>
                <input type="date" required className="w-full border border-gray-300 rounded p-2"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
                />
            </div>
        </div>

        {/* Notas */}
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas / Condiciones</label>
            <textarea 
                rows="3" 
                className="w-full border border-gray-300 rounded p-2"
                placeholder="Ej: Incluye transferencia. Oferta válida solo contado."
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
            ></textarea>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => navigate('/quotes')} className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200">Cancelar</button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 shadow">
                {loading ? 'Generando...' : 'Crear Cotización'}
            </button>
        </div>

      </form>
    </div>
  );
};

export default QuoteForm;