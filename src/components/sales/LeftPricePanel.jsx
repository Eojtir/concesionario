// src/components/sales/LeftPricePanel.jsx
import React from "react";
import { formatMoney, cleanMoney } from "../../utils/formatters";

const LeftPricePanel = ({ data, onChange, config }) => {
  const {
    precio_lista,
    pago_venta,
    descuento,
    bonificacion,
    valor_venta,
    iva,
    neto,
    intereses,
    total,
    tramites,
  } = data;

  const handleChange = (field, e) => {
    const raw = e.target.value.replace(/[^\d]/g, "");
    onChange(field, raw);
  };

  const InputRow = ({ label, value, onInputChange, readOnly = false, bold = false, blue = false, small = false }) => (
    <div className={`flex items-center gap-2 ${small ? "py-0.5" : "py-1"}`}>
      <label className={`w-28 text-right text-xs ${bold ? "font-bold text-gray-800" : "text-gray-600"} ${small ? "text-[10px]" : ""}`}>
        {label}
      </label>
      <input
        type="text"
        readOnly={readOnly}
        value={value ? formatMoney(value) : ""}
        onChange={(e) => onInputChange && onInputChange(e)}
        className={`flex-1 px-2 py-1 text-right text-xs font-mono border rounded transition-all ${
          readOnly
            ? "bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed"
            : blue
            ? "bg-blue-50 border-blue-300 text-blue-900 font-bold"
            : "bg-white border-gray-300 text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        } ${small ? "py-0.5" : ""}`}
        placeholder="0"
      />
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-4 py-2">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Negociación</h3>
      </div>
      <div className="p-3 space-y-1">
        <InputRow label="Precio Lista" value={precio_lista} readOnly blue />
        <InputRow label="Pago Venta" value={pago_venta} onInputChange={(e) => handleChange("pago_venta", e)} />

        <div className="border-t border-gray-200 my-1" />

        <InputRow label="Des. Accesorios" value={0} readOnly small />
        <InputRow label="Descuento" value={descuento} onInputChange={(e) => handleChange("descuento", e)} />
        <InputRow label="Bonificación" value={bonificacion} onInputChange={(e) => handleChange("bonificacion", e)} />

        <div className="border-t border-gray-200 my-1" />

        <InputRow label="Valor Venta" value={valor_venta} readOnly blue />
        <InputRow label={`IVA, ${(config.iva_rate * 100).toFixed(0)}%`} value={iva} readOnly small />
        <InputRow label="Neto" value={neto} readOnly blue />
        <InputRow label="Intereses" value={intereses} onInputChange={(e) => handleChange("intereses", e)} />

        <div className="border-t-2 border-gray-800 my-1" />

        <InputRow label="TOTAL" value={total} readOnly blue bold />
        <InputRow label="Trámites" value={tramites} onInputChange={(e) => handleChange("tramites", e)} />

        <div className="mt-2 pt-2 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <label className="w-28 text-right text-[10px] text-gray-500">FV Nº</label>
            <input type="text" className="w-16 px-2 py-0.5 text-xs border border-gray-300 rounded" placeholder="" />
            <label className="text-[10px] text-gray-500 ml-1">Caja</label>
            <input type="text" className="w-12 px-2 py-0.5 text-xs border border-gray-300 rounded" placeholder="" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeftPricePanel;