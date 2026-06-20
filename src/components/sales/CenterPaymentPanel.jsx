// src/components/sales/CenterPaymentPanel.jsx
import React from "react";
import { formatMoney, cleanMoney } from "../../utils/formatters";

const CenterPaymentPanel = ({ data, onChange, totalToPay, totalPaid, difference }) => {
  const fields = [
    { key: "efectivo", label: "Efectivo" },
    { key: "documentos", label: "Documentos" },
    { key: "vehiculo_usado", label: "Vehículo Usado" },
    { key: "credito_externo", label: "Cr. Externo" },
    { key: "prepago", label: "Prepago" },
    { key: "credito_simple", label: "Créd. Simple" },
    { key: "credito_veh_usado", label: "Cr. Veh. Usado" },
    { key: "letras_pagare", label: "Letras/Pagaré" },
  ];

  const handleChange = (key, e) => {
    const raw = e.target.value.replace(/[^\d]/g, "");
    onChange(key, raw);
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-4 py-2">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Formas de Pago</h3>
      </div>
      <div className="p-3 space-y-1">
        {/* Total a Pagar */}
        <div className="flex items-center gap-2 py-1">
          <label className="w-28 text-right text-xs font-bold text-gray-800">Total a Pagar</label>
          <div className="flex-1 px-2 py-1 text-right text-sm font-mono font-bold text-blue-900 bg-blue-50 border-2 border-blue-300 rounded">
            {formatMoney(totalToPay.toString())}
          </div>
        </div>

        <div className="border-t border-gray-200 my-1" />

        {/* Campos de pago */}
        {fields.map((f) => (
          <div key={f.key} className="flex items-center gap-2 py-0.5">
            <label className="w-28 text-right text-xs text-gray-600">{f.label}</label>
            <input
              type="text"
              value={data[f.key] ? formatMoney(data[f.key]) : ""}
              onChange={(e) => handleChange(f.key, e)}
              className="flex-1 px-2 py-1 text-right text-xs font-mono bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="0"
            />
          </div>
        ))}

        <div className="border-t-2 border-gray-800 my-1" />

        {/* Total Pagado */}
        <div className="flex items-center gap-2 py-1">
          <label className="w-28 text-right text-xs font-bold text-gray-800">Total Pagado</label>
          <div className="flex-1 px-2 py-1 text-right text-xs font-mono font-bold bg-gray-100 border border-gray-300 rounded text-gray-800">
            {formatMoney(totalPaid.toString())}
          </div>
        </div>

        {/* Diferencia */}
        <div className="flex items-center gap-2 py-1">
          <label className="w-28 text-right text-xs font-bold text-gray-800">Diferencia</label>
          <div className={`flex-1 px-2 py-1 text-right text-sm font-mono font-bold rounded border-2 ${
            Math.abs(difference) <= 1
              ? "bg-green-50 border-green-400 text-green-800"
              : difference > 0
              ? "bg-red-50 border-red-400 text-red-800"
              : "bg-amber-50 border-amber-400 text-amber-800"
          }`}>
            {formatMoney(difference.toString())}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CenterPaymentPanel;