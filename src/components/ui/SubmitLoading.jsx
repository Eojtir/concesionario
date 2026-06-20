// src/components/ui/SubmitLoading.jsx
import React from 'react';

export const SubmitLoading = ({ message = "Procesando solicitud..." }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl border border-gray-100 flex flex-col items-center space-y-4">
        {/* Spinner Animado */}
        <div className="relative flex items-center justify-center w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
        </div>
        
        {/* Mensaje Dinámico */}
        <div className="space-y-1">
          <p className="text-lg font-bold text-gray-800 animate-pulse">
            Por favor, espera
          </p>
          <p className="text-sm text-gray-500 font-medium">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};