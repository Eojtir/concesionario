// src/components/sales/VehicleHeader.jsx
import React from "react";

const VehicleHeader = ({ vehicle, client }) => {
  if (!vehicle) return null;

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-4">
      <div className="bg-gradient-to-r from-gray-900 to-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">
              {vehicle.make} {vehicle.model} {vehicle.year}
            </h2>
            <p className="text-gray-300 text-xs">
              Patente: <span className="text-white font-mono">{vehicle.plate}</span>
              {" · "}VIN: <span className="text-white font-mono">{vehicle.vin}</span>
              {" · "}Color: {vehicle.color}
              {" · "}{vehicle.km?.toLocaleString("es-CL")} km
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Precio Lista</p>
          <p className="text-lg font-bold font-mono text-white">
            ${vehicle.sale_price?.toLocaleString("es-CL")}
          </p>
        </div>
      </div>

      {client && (
        <div className="px-4 py-2 bg-blue-50 border-t border-blue-100 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="font-bold text-blue-900">{client.nombre_completo}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
            </svg>
            <span className="text-blue-800 font-mono">{client.rut}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="text-blue-800">{client.telefono}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleHeader;