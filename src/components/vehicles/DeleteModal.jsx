// ============================================
// src/components/vehicles/DeleteModal.jsx
// ============================================
import React from "react";
import { FiInfo, FiX } from "react-icons/fi";

const DeleteModal = ({ vehicle, onConfirm, onCancel }) => {
  if (!vehicle) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-md bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Eliminar Vehículo</h3>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-lg bg-slate-700/50 text-slate-400 flex items-center justify-center hover:bg-slate-600 hover:text-white transition-colors"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl mb-4">
          <p className="text-gray-200">
            ¿Confirmas la eliminación de:{" "}
            <span className="text-white font-bold">
              {vehicle.make} {vehicle.model}
            </span>
            ?
          </p>
        </div>

        <p className="text-xs text-rose-400 flex items-center gap-2 mb-6">
          <FiInfo /> Esta acción no se puede deshacer.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 text-slate-400 hover:text-white transition-colors rounded-xl"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-rose-500/20 transition-all"
          >
            Eliminar Definitivamente
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;