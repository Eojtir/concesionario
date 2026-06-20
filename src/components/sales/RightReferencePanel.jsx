// src/components/sales/RightReferencePanel.jsx
import React from "react";
import { formatMoney, cleanMoney } from "../../utils/formatters";

const RightReferencePanel = ({ data, onChange, labels }) => {
  const handleChange = (key, field, value) => {
    onChange(key, field, value);
  };

  const handleMoneyChange = (key, field, e) => {
    const raw = e.target.value.replace(/[^\d]/g, "");
    onChange(key, field, raw);
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-amber-600 to-amber-500 px-4 py-2">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Valores de Referencia</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[10px]">
          <thead>
            <tr className="bg-amber-50 text-amber-900">
              <th className="px-2 py-1 text-left font-bold border-b border-amber-200 w-32">Concepto</th>
              <th className="px-1 py-1 text-right font-bold border-b border-amber-200 w-16">Valor Ref.</th>
              <th className="px-1 py-1 text-center font-bold border-b border-amber-200 w-8">Cobro</th>
              <th className="px-1 py-1 text-right font-bold border-b border-amber-200 w-16">Paga Cliente</th>
              <th className="px-1 py-1 text-center font-bold border-b border-amber-200 w-8">Trámite</th>
              <th className="px-1 py-1 text-right font-bold border-b border-amber-200 w-14">Valor Regalo</th>
              <th className="px-1 py-1 text-right font-bold border-b border-amber-200 w-16">Paga Créd. Ext.</th>
            </tr>
          </thead>
          <tbody>
            {/* Fecha Facturación */}
            <tr className="bg-amber-100/50">
              <td className="px-2 py-1 font-semibold text-amber-900">Fecha Facturación</td>
              <td colSpan={6} className="px-2 py-1">
                <input
                  type="date"
                  value={data.fecha_facturacion || ""}
                  onChange={(e) => handleChange("fecha_facturacion", "value", e.target.value)}
                  className="w-full px-1 py-0.5 text-[10px] border border-amber-300 rounded bg-white"
                />
              </td>
            </tr>

            {Object.entries(labels).map(([key, label]) => {
              const item = data[key];
              if (!item) return null;
              return (
                <tr key={key} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                  <td className="px-2 py-1 text-gray-700 font-medium">{label}</td>
                  <td className="px-1 py-1">
                    <input
                      type="text"
                      value={item.referencia ? formatMoney(item.referencia.toString()) : ""}
                      onChange={(e) => handleMoneyChange(key, "referencia", e)}
                      className="w-full px-1 py-0.5 text-[10px] text-right font-mono border border-gray-200 rounded bg-white focus:ring-1 focus:ring-amber-500"
                      placeholder="0"
                    />
                  </td>
                  <td className="px-1 py-1 text-center">
                    <input
                      type="checkbox"
                      checked={item.cobro}
                      onChange={(e) => handleChange(key, "cobro", e.target.checked)}
                      className="w-3.5 h-3.5 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
                    />
                  </td>
                  <td className="px-1 py-1">
                    <input
                      type="text"
                      value={item.paga_cliente ? formatMoney(item.paga_cliente.toString()) : ""}
                      onChange={(e) => handleMoneyChange(key, "paga_cliente", e)}
                      className="w-full px-1 py-0.5 text-[10px] text-right font-mono border border-gray-200 rounded bg-white focus:ring-1 focus:ring-amber-500"
                      placeholder="0"
                    />
                  </td>
                  <td className="px-1 py-1 text-center">
                    <input
                      type="checkbox"
                      checked={item.tramite}
                      onChange={(e) => handleChange(key, "tramite", e.target.checked)}
                      className="w-3.5 h-3.5 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
                    />
                  </td>
                  <td className="px-1 py-1">
                    <input
                      type="text"
                      value={item.valor_regalo ? formatMoney(item.valor_regalo.toString()) : ""}
                      onChange={(e) => handleMoneyChange(key, "valor_regalo", e)}
                      className="w-full px-1 py-0.5 text-[10px] text-right font-mono border border-gray-200 rounded bg-white focus:ring-1 focus:ring-amber-500"
                      placeholder="0"
                    />
                  </td>
                  <td className="px-1 py-1">
                    <input
                      type="text"
                      value={item.paga_credito_ext ? formatMoney(item.paga_credito_ext.toString()) : ""}
                      onChange={(e) => handleMoneyChange(key, "paga_credito_ext", e)}
                      className="w-full px-1 py-0.5 text-[10px] text-right font-mono border border-gray-200 rounded bg-white focus:ring-1 focus:ring-amber-500"
                      placeholder="0"
                    />
                  </td>
                </tr>
              );
            })}

            {/* TOTAL GASTOS */}
            <tr className="bg-gray-900 text-white font-bold">
              <td className="px-2 py-1.5">TOTAL GASTOS</td>
              <td className="px-1 py-1.5 text-right font-mono">
                {formatMoney(
                  Object.values(data)
                    .filter((v) => typeof v === "object" && v.referencia)
                    .reduce((sum, v) => sum + (parseFloat(v.referencia) || 0), 0)
                    .toString()
                )}
              </td>
              <td className="px-1 py-1.5" />
              <td className="px-1 py-1.5 text-right font-mono text-amber-300">
                {formatMoney(
                  Object.values(data)
                    .filter((v) => typeof v === "object" && v.paga_cliente)
                    .reduce((sum, v) => sum + (parseFloat(v.paga_cliente) || 0), 0)
                    .toString()
                )}
              </td>
              <td className="px-1 py-1.5" />
              <td className="px-1 py-1.5" />
              <td className="px-1 py-1.5 text-right font-mono">
                {formatMoney(
                  Object.values(data)
                    .filter((v) => typeof v === "object" && v.paga_credito_ext)
                    .reduce((sum, v) => sum + (parseFloat(v.paga_credito_ext) || 0), 0)
                    .toString()
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RightReferencePanel;