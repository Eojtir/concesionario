// src/components/sales/tabs/SaleReferenceTab.jsx
import React, { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from "react";
import toast from "react-hot-toast";
import { formatMoney, cleanMoney } from "../../../utils/formatters";
import expenseSaleVehicleService from "../../../services/expenseSaleVehicleService";

// ============================================
// COMPONENTE
// ============================================
const SaleReferenceTab = forwardRef(({ vehicleId, onTotalsChange, onSaveStateChange }, ref) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [items, setItems] = useState([]);

  const isMountedRef = useRef(true);

  // ============================================
  // EXPONER MÉTODO save AL PADRE VIA ref
  // ============================================
  useImperativeHandle(ref, () => ({
    save: async () => {
      if (hasChanges && vehicleId) {
        await handleSave(true);
      }
    },
    hasChanges: () => hasChanges,
  }));

  // ============================================
  // CARGAR CATÁLOGO + DATOS DEL VEHÍCULO
  // ============================================
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!vehicleId) {
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setIsLoading(true);
        setHasChanges(false);

        const catalogRes = await expenseSaleVehicleService.getCatalog();
        const catalogData = catalogRes?.data?.data || catalogRes?.data || [];

        if (!Array.isArray(catalogData)) {
          toast.error("Error: El catálogo no tiene formato válido");
          setIsLoading(false);
          return;
        }

        if (catalogData.length === 0) {
          toast.error("No hay conceptos configurados en el catálogo de gastos");
          setIsLoading(false);
          return;
        }

        const vehicleRes = await expenseSaleVehicleService.getByVehicleId(vehicleId);
        const vehicleData = vehicleRes?.data?.data || vehicleRes?.data || [];
        
        // BANDERA: Verificamos si ya hay valores guardados previamente en el backend
        const hasBackendData = vehicleData.length > 0;

        const mapped = catalogData.map((cat) => {
          const found = vehicleData.find(
            (d) => d.gasto_id === cat.id || d.concepto === cat.nombre
          );

          const valorRef = found?.valor?.toString() || cat.valor_referencia?.toString() || "";
          let pagaCliente = found?.paga_cliente?.toString() || "";

          // REGLA ESTRICTA: Solo igualamos si el backend no devolvió NINGÚN historial para este vehículo
          if (!hasBackendData && (cat.cobro_default === 1 || cat.cobro_default === true)) {
            pagaCliente = valorRef;
          }

          let valorRegalo = found?.valor_regalo?.toString() || "";
          
          if (!valorRegalo && valorRef && pagaCliente) {
            const diff = (parseFloat(cleanMoney(valorRef)) || 0) - (parseFloat(cleanMoney(pagaCliente)) || 0);
            if (diff > 0) valorRegalo = diff.toString();
          }

          return {
            id: cat.id,
            codigo: cat.codigo || String(cat.id),
            label: cat.nombre,
            descripcion: cat.descripcion || "",
            esAccesorio: cat.es_accesorio === 1 || cat.es_accesorio === true,
            orden: cat.orden || 0,
            dbId: found?.id || null,
            valor_referencia: valorRef,
            cobro: found?.cobro === 1 || found?.cobro === true || cat.cobro_default === 1,
            paga_cliente: pagaCliente,
            tramite: found?.tramite === 1 || found?.tramite === true || cat.tramite_default === 1,
            valor_regalo: valorRegalo,
            paga_credito_ext: found?.paga_credito_ext?.toString() || "",
          };
        });

        mapped.sort((a, b) => (a.orden || 0) - (b.orden || 0));
        setItems(mapped);

      } catch (err) {
        toast.error("No se pudieron cargar los valores de referencia: " + (err?.message || "Error desconocido"));
      } finally {
        if (isMountedRef.current) setIsLoading(false);
      }
    };

    loadData();
  }, [vehicleId]);

  // ============================================
  // CALCULAR TOTALES
  // ============================================
  const calcularTotales = useCallback(() => {
    const totalReferencia = items.reduce((sum, item) => sum + (parseFloat(cleanMoney(item.valor_referencia)) || 0), 0);
    const totalPagaCliente = items.reduce((sum, item) => sum + (parseFloat(cleanMoney(item.paga_cliente)) || 0), 0);
    const totalRegalo = items.reduce((sum, item) => sum + (parseFloat(cleanMoney(item.valor_regalo)) || 0), 0);
    const totalCreditoExt = items.reduce((sum, item) => sum + (parseFloat(cleanMoney(item.paga_credito_ext)) || 0), 0);

    return {
      totalReferencia,
      totalPagaCliente,
      totalRegalo,
      totalCreditoExt,
      totalGastos: totalPagaCliente,
    };
  }, [items]);

  useEffect(() => {
    if (onTotalsChange) onTotalsChange(calcularTotales());
  }, [items, calcularTotales, onTotalsChange]);

  useEffect(() => {
    if (onSaveStateChange) onSaveStateChange(hasChanges);
  }, [hasChanges, onSaveStateChange]);

  // ============================================
  // HANDLERS
  // ============================================
  const calcularRegalo = (valorRef, pagaCliente) => {
    const ref = parseFloat(cleanMoney(valorRef)) || 0;
    const paga = parseFloat(cleanMoney(pagaCliente)) || 0;
    const diff = ref - paga;
    return diff > 0 ? diff.toString() : "";
  };

  const updateItem = (id, field, value) => {
    setHasChanges(true);
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        const updated = { ...item, [field]: value };

        if (field === "valor_referencia" && item.cobro) {
          updated.paga_cliente = value;
          updated.valor_regalo = calcularRegalo(value, value);
        }

        if (field === "paga_cliente") {
          updated.valor_regalo = calcularRegalo(item.valor_referencia, value);
        }

        if (field === "cobro" && !value) {
          updated.paga_cliente = "";
          updated.valor_regalo = "";
        }

        if (field === "cobro" && value && item.valor_referencia) {
          updated.paga_cliente = item.valor_referencia;
          updated.valor_regalo = calcularRegalo(item.valor_referencia, item.valor_referencia);
        }

        return updated;
      })
    );
  };

  const handleMoneyChange = (id, field, e) => {
    const raw = e.target.value.replace(/[^\d]/g, "");
    updateItem(id, field, raw);
  };

  // ============================================
  // GUARDAR
  // ============================================
  const handleSave = async (isSilent = false) => {
    if (!vehicleId) {
      if (!isSilent) toast.error("Debe seleccionar un vehículo primero");
      return;
    }

    try {
      setIsSaving(true);
      let savedCount = 0;
      let errors = [];

      for (const item of items) {
        if (!item.id) {
          errors.push(`${item.label}: falta gasto_id`);
          continue;
        }

        const payload = {
          vehicle_id: parseInt(vehicleId, 10),
          gasto_id: parseInt(item.id, 10),
          concepto: item.label,
          valor: parseFloat(cleanMoney(item.valor_referencia)) || 0,
          cobro: item.cobro ? 1 : 0,
          paga_cliente: parseFloat(cleanMoney(item.paga_cliente)) || 0,
          tramite: item.tramite ? 1 : 0,
          valor_regalo: parseFloat(cleanMoney(item.valor_regalo)) || 0,
          paga_credito_ext: parseFloat(cleanMoney(item.paga_credito_ext)) || 0,
        };

        try {
          if (item.dbId) {
            await expenseSaleVehicleService.update(item.dbId, payload);
          } else {
            const res = await expenseSaleVehicleService.create(payload);
            if (res?.data?.id || res?.data?.data?.id) {
              item.dbId = res.data.id || res.data.data.id;
            }
          }
          savedCount++;
        } catch (itemErr) {
          errors.push(`${item.label}: ${itemErr?.response?.data?.message || itemErr.message}`);
        }
      }

      setHasChanges(false);

      if (errors.length > 0) {
        toast.error(`Errores: ${errors.join(", ")}`);
      } else if (!isSilent) {
        toast.success(`Valores guardados exitosamente (${savedCount} registros)`);
      }
    } catch (err) {
      if (!isSilent) toast.error("Error al guardar los valores");
    } finally {
      if (isMountedRef.current) setIsSaving(false);
    }
  };

  // ============================================
  // RENDER
  // ============================================
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="ml-3 text-sm text-gray-500">Cargando valores...</span>
      </div>
    );
  }

  if (!vehicleId) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
        <svg className="w-10 h-10 text-blue-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-blue-800 font-medium text-sm">Seleccione un vehículo para ver los valores de referencia</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
        <svg className="w-10 h-10 text-amber-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-amber-800 font-medium text-sm">No hay conceptos configurados en el catálogo de gastos</p>
        <p className="text-amber-600 text-xs mt-1">Contacte al administrador para configurar el catálogo maestro</p>
      </div>
    );
  }

  const totales = calcularTotales();

  return (
    <div className="space-y-4">
      {hasChanges && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 flex items-center gap-2">
          <svg className="w-4 h-4 text-amber-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-xs text-amber-800 font-medium">Hay cambios sin guardar. No olvide presionar Guardar o se guardarán al cambiar de pestaña.</span>
        </div>
      )}

      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 rounded-t-xl px-4 py-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Valores de Referencia y Trámites
        </h3>
      </div>

      <div className="bg-white rounded-b-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-blue-50 text-blue-900">
                <th className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider border-b border-blue-200 w-44">Concepto</th>
                <th className="px-2 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider border-b border-blue-200 w-24">Valor Referencia</th>
                <th className="px-2 py-2.5 text-center text-[11px] font-bold uppercase tracking-wider border-b border-blue-200 w-14">Cobro</th>
                <th className="px-2 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider border-b border-blue-200 w-24">Paga Cliente</th>
                <th className="px-2 py-2.5 text-center text-[11px] font-bold uppercase tracking-wider border-b border-blue-200 w-14">Trámite</th>
                <th className="px-2 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider border-b border-blue-200 w-20">Valor Regalo</th>
                <th className="px-2 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider border-b border-blue-200 w-24">Paga Crédito Ext.</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item, index) => {
                const isAccesorio = item.esAccesorio;
                const isEven = index % 2 === 0;

                return (
                  <tr
                    key={item.id}
                    className={`transition-colors ${
                      isAccesorio
                        ? "bg-blue-50/40 hover:bg-blue-100/40"
                        : isEven
                        ? "bg-white hover:bg-gray-50"
                        : "bg-gray-50/50 hover:bg-gray-100/50"
                    }`}
                  >
                    <td className="px-3 py-2 border-b border-gray-100">
                      <span className={`text-xs font-semibold ${isAccesorio ? "text-blue-800" : "text-gray-700"}`}>
                        {item.label}
                      </span>
                      {item.descripcion && (
                        <p className="text-[10px] text-gray-400 mt-0.5">{item.descripcion}</p>
                      )}
                    </td>

                    <td className="px-2 py-2 border-b border-gray-100">
                      <input
                        type="text"
                        value={item.valor_referencia ? formatMoney(item.valor_referencia) : ""}
                        onChange={(e) => handleMoneyChange(item.id, "valor_referencia", e)}
                        disabled={isSaving}
                        className="w-full px-2 py-1 text-xs text-right font-mono border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-100 disabled:text-gray-400"
                        placeholder="0"
                      />
                    </td>

                    <td className="px-2 py-2 border-b border-gray-100 text-center">
                      <input
                        type="checkbox"
                        checked={item.cobro}
                        onChange={(e) => updateItem(item.id, "cobro", e.target.checked)}
                        disabled={isSaving}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
                      />
                    </td>

                    <td className="px-2 py-2 border-b border-gray-100">
                      <input
                        type="text"
                        value={item.paga_cliente ? formatMoney(item.paga_cliente) : ""}
                        onChange={(e) => handleMoneyChange(item.id, "paga_cliente", e)}
                        disabled={isSaving || !item.cobro}
                        className={`w-full px-2 py-1 text-xs text-right font-mono border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400 ${
                          item.cobro ? "bg-white border-gray-300" : "bg-gray-100 border-gray-200 text-gray-400"
                        }`}
                        placeholder="0"
                      />
                    </td>

                    <td className="px-2 py-2 border-b border-gray-100 text-center">
                      <input
                        type="checkbox"
                        checked={item.tramite}
                        onChange={(e) => updateItem(item.id, "tramite", e.target.checked)}
                        disabled={isSaving}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
                      />
                    </td>

                    <td className="px-2 py-2 border-b border-gray-100">
                      <input
                        type="text"
                        value={item.valor_regalo ? formatMoney(item.valor_regalo) : ""}
                        readOnly
                        disabled={isSaving}
                        className="w-full px-2 py-1 text-xs text-right font-mono border border-gray-200 rounded bg-blue-50/50 text-blue-700 disabled:bg-gray-100 disabled:text-gray-400 cursor-default"
                        placeholder="0"
                        title="Regalo = Valor Referencia - Paga Cliente"
                      />
                    </td>

                    <td className="px-2 py-2 border-b border-gray-100">
                      <input
                        type="text"
                        value={item.paga_credito_ext ? formatMoney(item.paga_credito_ext) : ""}
                        onChange={(e) => handleMoneyChange(item.id, "paga_credito_ext", e)}
                        disabled={isSaving}
                        className="w-full px-2 py-1 text-xs text-right font-mono border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-100 disabled:text-gray-400"
                        placeholder="0"
                      />
                    </td>
                  </tr>
                );
              })}

              <tr className="bg-blue-900 text-white">
                <td className="px-3 py-3 text-xs font-bold uppercase tracking-wider">TOTAL GASTOS</td>
                <td className="px-2 py-3 text-right text-xs font-mono font-bold">{formatMoney(totales.totalReferencia.toString())}</td>
                <td className="px-2 py-3" />
                <td className="px-2 py-3 text-right text-xs font-mono font-bold text-blue-200">{formatMoney(totales.totalPagaCliente.toString())}</td>
                <td className="px-2 py-3" />
                <td className="px-2 py-3" />
                <td className="px-2 py-3 text-right text-xs font-mono font-bold">{formatMoney(totales.totalCreditoExt.toString())}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs">
            <span className="text-gray-500">
              Total Referencia: <span className="font-mono font-bold text-gray-800">{formatMoney(totales.totalReferencia.toString())}</span>
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-500">
              Paga Cliente: <span className="font-mono font-bold text-green-700">{formatMoney(totales.totalPagaCliente.toString())}</span>
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-500">
              Regalo: <span className="font-mono font-bold text-blue-700">{formatMoney(totales.totalRegalo.toString())}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={isSaving || !hasChanges}
            className={`inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white rounded-lg shadow transition-all ${
              isSaving || !hasChanges
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 hover:from-blue-800 hover:via-blue-700 hover:to-blue-600 hover:shadow-md"
            }`}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Guardando...
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Guardar Valores
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
        <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="text-sm text-blue-800">
          <span className="font-bold">Total gastos que paga el cliente:</span>{" "}
          <span className="font-mono font-bold text-blue-900">{formatMoney(totales.totalPagaCliente.toString())}</span>
          {" · "}Este valor se utilizará automáticamente en la pestaña de Negociación.
        </div>
      </div>
    </div>
  );
});

SaleReferenceTab.displayName = "SaleReferenceTab";

export default SaleReferenceTab;