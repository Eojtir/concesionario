import React, { useState } from 'react';
import saleService from '../services/saleService';
import { pdf } from '@react-pdf/renderer'; 
import ContractPDF from './ContractPDF';  

const SaleModal = ({ vehicle, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  
  // Estado inicial ampliado
  const [formData, setFormData] = useState({
    sale_price: vehicle.sale_price || '',
    sale_date: new Date().toISOString().split('T')[0],
    payment_method: 'Transferencia',
    notes: '',
    
    // Datos Cliente
    client_name: '',
    client_rut: '',
    client_phone: '',
    client_email: '',
    client_address: '',
    client_city: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    if (!window.confirm(`¿Confirmas la venta?`)) return;

    setLoading(true);
    try {
      // 1. Guardar en Base de Datos (PHP)
      // Ya NO necesitamos que el backend devuelva la URL del PDF, solo el OK.
      const response = await saleService.create({
        ...formData,
        vehicle_id: vehicle.id
      });

      // 2. Generar el PDF en el navegador (React)
      // Creamos el blob (archivo binario en memoria)
      const blob = await pdf(
        <ContractPDF saleData={formData} vehicle={vehicle} />
      ).toBlob();

      // 3. Forzar la descarga del archivo
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Contrato_${vehicle.plate}_${formData.client_rut}.pdf`;
      link.click();
      URL.revokeObjectURL(url); // Limpieza de memoria

      // 4. Éxito
      alert('Venta registrada y contrato descargado.');
      onSuccess();

    } catch (error) {
      console.error(error);
      alert('Error: ' + (error.response?.data?.error || 'Falló la operación'));
    } finally {
      setLoading(false);
    }
};

  // Formateador de moneda para visualización
  const formatMoney = (amount) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-4 flex justify-between items-center">
          <div>
            <h3 className="text-white font-bold text-xl">Cerrar Venta & Documentación</h3>
            <p className="text-blue-100 text-xs mt-1">
              {vehicle.make} {vehicle.model} ({vehicle.year}) - {vehicle.plate}
            </p>
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-200 text-3xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* SECCIÓN 1: DATOS DE LA TRANSACCIÓN */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-500 uppercase border-b pb-1">Datos de la Operación</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Precio Final de Venta</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input 
                    type="number" name="sale_price" required
                    value={formData.sale_price} onChange={handleChange}
                    className="pl-8 block w-full border border-gray-300 rounded p-2 font-bold text-gray-800 text-lg focus:ring-blue-500 focus:border-blue-500" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha Cierre</label>
                  <input type="date" name="sale_date" required
                    value={formData.sale_date} onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded p-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Forma de Pago</label>
                  <select 
                    name="payment_method" 
                    value={formData.payment_method} 
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded p-2 text-sm bg-white"
                  >
                    <option value="Transferencia">Transferencia</option>
                    <option value="Vale Vista">Vale Vista</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Credito">Crédito Automotriz</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Notas / Cláusulas</label>
                <textarea 
                  name="notes" 
                  rows="3"
                  placeholder="Ej: Se incluye transferencia. Vehículo con detalles de pintura..."
                  value={formData.notes} onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded p-2 text-sm"
                ></textarea>
              </div>
            </div>

            {/* SECCIÓN 2: DATOS DEL CLIENTE (PARA CONTRATO) */}
            <div className="space-y-4 bg-gray-50 p-4 rounded border border-gray-100">
              <h4 className="text-sm font-bold text-blue-800 uppercase border-b border-blue-200 pb-1">Datos del Comprador (Contrato)</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre Completo / Razón Social</label>
                <input type="text" name="client_name" required
                  value={formData.client_name} onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded p-2 text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">RUT / DNI</label>
                  <input type="text" name="client_rut" required placeholder="12.345.678-9"
                    value={formData.client_rut} onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded p-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                  <input type="text" name="client_phone"
                    value={formData.client_phone} onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded p-2 text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email (Para envío digital)</label>
                <input type="email" name="client_email"
                  value={formData.client_email} onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded p-2 text-sm" />
              </div>

              {/* CAMPOS CRÍTICOS PARA CONTRATO */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Dirección (Calle y N°)</label>
                  <input type="text" name="client_address" required placeholder="Av. Siempre Viva 742"
                    value={formData.client_address} onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded p-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Comuna</label>
                  <input type="text" name="client_city" required placeholder="Santiago"
                    value={formData.client_city} onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded p-2 text-sm" />
                </div>
              </div>

            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-5 py-2 border border-gray-300 text-gray-600 rounded hover:bg-gray-50 font-medium">
              Cancelar
            </button>
            <button type="submit" disabled={loading} 
              className="px-5 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 shadow flex items-center gap-2">
              {loading ? 'Procesando...' : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Confirmar Venta
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default SaleModal;