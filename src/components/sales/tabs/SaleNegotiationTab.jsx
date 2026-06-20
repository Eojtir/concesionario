// src/components/sales/tabs/SaleNegotiationTab.jsx
import React, { useState, useEffect, useMemo } from "react";
import { formatMoney } from "../../../utils/formatters";

const SaleNegotiationTab = ({ vehicle, referenceTotals, onTotalsChange }) => {
  // ============================================
  // ESTADO LOCAL: VALORES DE NEGOCIACIÓN
  // ============================================
  const [form, setForm] = useState({
    // Columna Izquierda (Venta)
    precioLista: vehicle?.sale_price?.toString() || "",
    accesorios: "",
    descuentoAccesorios: "",
    descuento: "",
    bonificacion: "",
    ivaPorcentaje: "19.00", // Fijo por defecto o configurable
    ivaValor: "", 
    intereses: "",
    tramites: referenceTotals?.totalGastos?.toString() || "",

    // Columna Derecha (Pagos)
    efectivo: "",
    documentos: "",
    vehiculoUsado: "",
    crExterno: "",
    prepago: "",
    credSimple: "",
    crVehUsado: "",
    letrasPagare: "",
    vuelto: "",
  });

  // ============================================
  // SINCRONIZACIÓN CON PESTAÑA DE REFERENCIAS
  // ============================================
  useEffect(() => {
    if (referenceTotals && referenceTotals.totalGastos !== undefined) {
      setForm((prev) => ({
        ...prev,
        tramites: referenceTotals.totalGastos.toString(),
      }));
    }
  }, [referenceTotals]);

  // Sincronizar precio lista si el vehículo cambia
  useEffect(() => {
    if (vehicle?.sale_price) {
      setForm((prev) => ({
        ...prev,
        precioLista: vehicle.sale_price.toString(),
      }));
    }
  }, [vehicle]);

  // ============================================
  // HANDLERS
  // ============================================
  const handleMoneyChange = (field, e) => {
    // Se extraen solo dígitos puros para evitar problemas con separadores de miles
    const rawValue = e.target.value.replace(/[^\d]/g, "");
    setForm((prev) => ({ ...prev, [field]: rawValue }));
  };

  const handlePercentageChange = (field, e) => {
    // Permite números y un punto decimal
    const rawValue = e.target.value.replace(/[^0-9.]/g, "");
    setForm((prev) => ({ ...prev, [field]: rawValue }));
  };

  // ============================================
  // CÁLCULOS EN TIEMPO REAL (Derived State)
  // ============================================
  const calc = useMemo(() => {
    const val = (str) => parseFloat(str) || 0;

    // --- LÓGICA DE VENTA (Izquierda) ---
    const precioVenta = val(form.precioLista) + val(form.accesorios);
    const valorVenta = precioVenta - val(form.descuentoAccesorios) - val(form.descuento) - val(form.bonificacion);
    const neto = valorVenta; // Basado en la imagen, el neto es igual al valor de venta
    const totalVenta = neto + val(form.intereses);
    const totalAPagar = totalVenta + val(form.tramites);

    // --- LÓGICA DE PAGOS (Derecha) ---
    const totalPagado = 
      val(form.efectivo) + 
      val(form.documentos) + 
      val(form.vehiculoUsado) + 
      val(form.crExterno) + 
      val(form.prepago) + 
      val(form.credSimple) + 
      val(form.crVehUsado) + 
      val(form.letrasPagare);

    const diferencia = totalAPagar - totalPagado - val(form.vuelto);

    return {
      precioVenta,
      valorVenta,
      neto,
      totalVenta,
      totalAPagar,
      totalPagado,
      diferencia
    };
  }, [form]);

  // Notificar al componente padre si es necesario guardar el estado
  useEffect(() => {
    if (onTotalsChange) {
      onTotalsChange(calc);
    }
  }, [calc, onTotalsChange]);

  // ============================================
  // COMPONENTES AUXILIARES UI
  // ============================================
  const RowInput = ({ label, id, value, onChange, isReadOnly, isHighlight, icon }) => (
    <div className="flex items-center text-sm border-b border-gray-100 last:border-0">
      <div className="w-1/3 py-2 px-3 bg-gray-50/50 text-gray-600 font-medium flex items-center justify-between">
        {label}
        {icon && <span className="text-gray-400 bg-gray-200/50 p-0.5 rounded shadow-sm">{icon}</span>}
      </div>
      <div className="w-2/3 p-1.5">
        <input
          type="text"
          id={id}
          value={value ? formatMoney(value.toString()) : ""}
          onChange={(e) => onChange && onChange(id, e)}
          readOnly={isReadOnly}
          placeholder="0"
          className={`w-full px-3 py-1.5 text-right font-mono text-sm rounded transition-colors focus:outline-none ${
            isReadOnly
              ? isHighlight
                ? "bg-blue-50/50 border border-blue-200 text-blue-800 font-bold shadow-inner"
                : "bg-gray-100 border border-gray-200 text-gray-700 font-bold"
              : "bg-white border border-gray-300 text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
          }`}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* HEADER TABS */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 rounded-t-xl px-4 py-3 shadow-sm">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Hoja de Negociación y Cierre
        </h3>
      </div>

      <div className="bg-white rounded-b-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
          
          {/* ============================================ */}
          {/* COLUMNA IZQUIERDA: VALORES Y COSTOS          */}
          {/* ============================================ */}
          <div className="flex flex-col bg-white">
            <RowInput label="Precio Lista" id="precioLista" value={form.precioLista} onChange={handleMoneyChange} icon={<ChartBarIcon />} />
            <RowInput label="Accesorios" id="accesorios" value={form.accesorios} onChange={handleMoneyChange} />
            <RowInput label="Precio Venta" id="precioVenta" value={calc.precioVenta} isReadOnly isHighlight />
            <RowInput label="Des. Accesorios" id="descuentoAccesorios" value={form.descuentoAccesorios} onChange={handleMoneyChange} />
            <RowInput label="Descuento" id="descuento" value={form.descuento} onChange={handleMoneyChange} />
            <RowInput label="Bonificación" id="bonificacion" value={form.bonificacion} onChange={handleMoneyChange} />
            <RowInput label="Valor Venta" id="valorVenta" value={calc.valorVenta} isReadOnly isHighlight />
            
            <div className="flex items-center text-sm border-b border-gray-100">
              <div className="w-1/3 py-2 px-3 bg-gray-50/50 text-gray-600 font-medium flex items-center gap-2">
                IVA
                <input
                  type="text"
                  value={form.ivaPorcentaje}
                  onChange={(e) => handlePercentageChange("ivaPorcentaje", e)}
                  className="w-16 px-1 py-0.5 text-right font-mono text-xs border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                />
                <span className="text-xs">%</span>
              </div>
              <div className="w-2/3 p-1.5">
                <input
                  type="text"
                  value={form.ivaValor ? formatMoney(form.ivaValor) : ""}
                  onChange={(e) => handleMoneyChange("ivaValor", e)}
                  placeholder="0"
                  className="w-full px-3 py-1.5 text-right font-mono text-sm bg-white border border-gray-300 text-gray-800 rounded focus:border-blue-500 focus:outline-none shadow-sm"
                />
              </div>
            </div>

            <RowInput label="Neto" id="neto" value={calc.neto} isReadOnly isHighlight />
            <RowInput label="Intereses" id="intereses" value={form.intereses} onChange={handleMoneyChange} icon={<ChartBarIcon />} />
            
            <div className="flex items-center text-sm border-b border-gray-200 bg-gray-50">
              <div className="w-1/3 py-3 px-3 text-gray-800 font-bold uppercase tracking-wider">TOTAL</div>
              <div className="w-2/3 p-1.5">
                <input
                  type="text"
                  value={formatMoney(calc.totalVenta.toString())}
                  readOnly
                  className="w-full px-3 py-2 text-right font-mono text-base bg-transparent text-blue-900 font-extrabold focus:outline-none"
                />
              </div>
            </div>
            
            <RowInput label="Trámites" id="tramites" value={form.tramites} onChange={handleMoneyChange} />
          </div>

          {/* ============================================ */}
          {/* COLUMNA DERECHA: FORMAS DE PAGO              */}
          {/* ============================================ */}
          <div className="flex flex-col bg-gray-50/30">
            <div className="flex items-center text-sm border-b-2 border-blue-200 bg-blue-50">
              <div className="w-1/3 py-3 px-3 text-blue-900 font-bold uppercase tracking-wider">Total a Pagar</div>
              <div className="w-2/3 p-1.5">
                <input
                  type="text"
                  value={formatMoney(calc.totalAPagar.toString())}
                  readOnly
                  className="w-full px-3 py-2 text-right font-mono text-lg bg-transparent text-blue-700 font-black focus:outline-none"
                />
              </div>
            </div>

            <RowInput label="Efectivo" id="efectivo" value={form.efectivo} onChange={handleMoneyChange} />
            <RowInput label="Documentos" id="documentos" value={form.documentos} onChange={handleMoneyChange} />
            <RowInput label="Vehículo Usado" id="vehiculoUsado" value={form.vehiculoUsado} onChange={handleMoneyChange} isReadOnly={false} />
            <RowInput label="Cr. Externo" id="crExterno" value={form.crExterno} onChange={handleMoneyChange} />
            <RowInput label="Prepago" id="prepago" value={form.prepago} onChange={handleMoneyChange} />
            <RowInput label="Créd. Simple" id="credSimple" value={form.credSimple} onChange={handleMoneyChange} />
            <RowInput label="Cr. Veh. Usado" id="crVehUsado" value={form.crVehUsado} onChange={handleMoneyChange} isReadOnly={false} />
            <RowInput label="Letras/Pagaré" id="letrasPagare" value={form.letrasPagare} onChange={handleMoneyChange} isReadOnly={false} />

            <div className="flex items-center text-sm border-y border-gray-300 bg-gray-100">
              <div className="w-1/3 py-3 px-3 text-gray-800 font-bold uppercase tracking-wider">Total Pagado</div>
              <div className="w-2/3 p-1.5">
                <input
                  type="text"
                  value={formatMoney(calc.totalPagado.toString())}
                  readOnly
                  className="w-full px-3 py-2 text-right font-mono text-base bg-transparent text-gray-800 font-extrabold focus:outline-none"
                />
              </div>
            </div>

            <RowInput label="Vuelto" id="vuelto" value={form.vuelto} onChange={handleMoneyChange} />
            
            <div className={`flex items-center text-sm border-t-2 mt-auto ${calc.diferencia !== 0 ? 'border-amber-200 bg-amber-50' : 'border-green-200 bg-green-50'}`}>
              <div className={`w-1/3 py-3 px-3 font-bold uppercase tracking-wider ${calc.diferencia !== 0 ? 'text-amber-900' : 'text-green-900'}`}>DEUDA</div>
              <div className="w-2/3 p-1.5">
                <input
                  type="text"
                  value={formatMoney(calc.diferencia.toString())}
                  readOnly
                  className={`w-full px-3 py-2 text-right font-mono text-lg bg-transparent font-black focus:outline-none ${calc.diferencia !== 0 ? 'text-amber-700' : 'text-green-700'}`}
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

// Ícono auxiliar extraído para mantener limpio el mapeo
const ChartBarIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

export default SaleNegotiationTab;