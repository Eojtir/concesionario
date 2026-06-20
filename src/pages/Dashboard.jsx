/* eslint-disable no-case-declarations */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import { formatDate } from "../utils/formatDate";
import { formatMoney } from "../utils/formatters";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// ============================================
// CONFIGURACIÓN DE ESTADOS
// ============================================
const STATUS_CONFIG = {
  available: {
    label: "Disponibles",
    color: "from-emerald-500 to-emerald-700",
    bg: "bg-emerald-500",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    icon: "✅",
  },
  sold: {
    label: "Vendidos",
    color: "from-rose-500 to-rose-700",
    bg: "bg-rose-500",
    text: "text-rose-400",
    border: "border-rose-500/30",
    icon: "💰",
  },
  maintenance: {
    label: "Mantenimiento",
    color: "from-amber-500 to-amber-700",
    bg: "bg-amber-500",
    text: "text-amber-400",
    border: "border-amber-500/30",
    icon: "🔧",
  },
  reserved: {
    label: "Reservados",
    color: "from-sky-500 to-sky-700",
    bg: "bg-sky-500",
    text: "text-sky-400",
    border: "border-sky-500/30",
    icon: "⏳",
  },
};

const STATUS_COLORS = {
  available: "#10b981",
  sold: "#f43f5e",
  maintenance: "#f59e0b",
  reserved: "#0ea5e9",
};

// ============================================
// SUB-COMPONENTES
// ============================================

const Sparkline = ({ data, color = "#06b6d4" }) => {
  if (!data || data.length < 2) return <div className="h-10 w-full" />;
  const chartData = data.map((v, i) => ({ i, v }));
  return (
    <div className="h-10 w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            fill={color}
            fillOpacity={0.15}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const StatCard = ({ title, value, color, icon, sparklineData, sparkColor, trend, trendValue }) => (
  <div className="group relative overflow-hidden rounded-2xl bg-slate-800/60 backdrop-blur-md border border-slate-700/50 p-5 hover:border-cyan-500/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] hover:-translate-y-1">
    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${color} opacity-60 group-hover:opacity-100 transition-opacity`} />
    <div className="flex justify-between items-start mb-3">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-lg shadow-lg`}>
        {icon}
      </div>
      {trend && (
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend === "up" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
          {trend === "up" ? "▲" : "▼"} {trendValue}
        </span>
      )}
    </div>
    <div className="text-2xl font-bold text-white mb-1 tracking-tight">{value}</div>
    <div className="text-sm text-slate-400 font-medium">{title}</div>
    {sparklineData && <Sparkline data={sparklineData} color={sparkColor} />}
  </div>
);

const SectionDivider = ({ title, colorClass = "from-cyan-500 to-indigo-500" }) => (
  <div className="col-span-full flex items-center gap-4 my-2">
    <div className={`h-px flex-1 bg-gradient-to-r ${colorClass} opacity-30`} />
    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{title}</span>
    <div className={`h-px flex-1 bg-gradient-to-l ${colorClass} opacity-30`} />
  </div>
);

const StatusCard = ({ status, data, onClick }) => {
  const config = STATUS_CONFIG[status] || {
    label: status,
    color: "from-slate-600 to-slate-800",
    bg: "bg-slate-500",
    text: "text-slate-400",
    border: "border-slate-500/30",
    icon: "🚗",
  };

  const pieData = [
    { name: "Este", value: data.count || 0 },
    { name: "Resto", value: Math.max((data.total_stock || 100) - (data.count || 0), 0) },
  ];

  return (
    <div
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl bg-slate-800/60 backdrop-blur-md border border-slate-700/50 p-5 cursor-pointer hover:border-cyan-500/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] hover:-translate-y-1"
    >
      <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${config.color}`} />
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform`}>
          {config.icon}
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full bg-slate-700/50 ${config.text} border ${config.border}`}>
          {config.label}
        </span>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="text-3xl font-bold text-white mb-1">{data.count || 0}</div>
          <div className="text-sm text-slate-400">unidades</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-white">{formatMoney(data.value || 0)}</div>
          <div className="text-xs text-slate-500">valor total</div>
        </div>
      </div>

      <div className="mt-4 h-2 w-full bg-slate-700/50 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${config.color} transition-all duration-1000`}
          style={{ width: `${Math.min(((data.count || 0) / (data.total_stock || 1)) * 100, 100)}%` }}
        />
      </div>
    </div>
  );
};

const LotCard = ({ lot }) => {
  const occupancyRate = lot.capacity > 0 ? (lot.current_vehicles / lot.capacity) * 100 : 0;
  const isFull = lot.free_spaces <= 0;
  const isAlmostFull = occupancyRate >= 80;

  const statusColor = isFull
    ? "from-rose-500 to-rose-700"
    : isAlmostFull
    ? "from-amber-500 to-amber-700"
    : "from-emerald-500 to-emerald-700";

  const statusText = isFull ? "Lleno" : isAlmostFull ? "Casi lleno" : "Disponible";
  const statusBg = isFull
    ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
    : isAlmostFull
    ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
    : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-slate-800/60 backdrop-blur-md border border-slate-700/50 p-5 hover:border-cyan-500/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]">
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${statusColor}`} />
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-white group-hover:text-cyan-400 transition-colors">{lot.lot_name}</h3>
        <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${statusBg}`}>
          {statusText}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/30">
          <div className="text-xs text-slate-500 mb-1">Capacidad</div>
          <div className="text-white font-bold">{lot.capacity}</div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/30">
          <div className="text-xs text-slate-500 mb-1">Ocupados</div>
          <div className="text-white font-bold">{lot.current_vehicles}</div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/30">
          <div className="text-xs text-slate-500 mb-1">Libres</div>
          <div className="text-cyan-400 font-bold">{lot.free_spaces}</div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/30">
          <div className="text-xs text-slate-500 mb-1">Valor</div>
          <div className="text-emerald-400 font-bold text-sm">{formatMoney(lot.inventory_value)}</div>
        </div>
      </div>

      <div className="relative">
        <div className="w-full bg-slate-700/30 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${statusColor} transition-all duration-1000 relative`}
            style={{ width: `${Math.min(occupancyRate, 100)}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </div>
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-slate-500">Ocupación</span>
          <span className="text-xs font-bold text-white">{occupancyRate.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};

const VehicleCard = ({ vehicle, onClick }) => {
  const statusConfig = STATUS_CONFIG[vehicle.status?.toLowerCase()] || STATUS_CONFIG.available;
  
  const getVehicleImage = () => {
    if (vehicle.image) return vehicle.image;
    if (vehicle.photo) return vehicle.photo;
    if (vehicle.photo_url) return vehicle.photo_url;
    return null;
  };

  const imageUrl = getVehicleImage();
  const initials = `${vehicle.make?.[0] || ""}${vehicle.model?.[0] || ""}`.toUpperCase();

  return (
    <div
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl bg-slate-800/60 backdrop-blur-md border border-slate-700/50 cursor-pointer hover:border-cyan-500/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] hover:-translate-y-1"
    >
      {/* Imagen o Placeholder */}
      <div className="relative h-40 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${statusConfig.color} flex items-center justify-center ${imageUrl ? "hidden" : "flex"}`}
        >
          <span className="text-4xl font-bold text-white/30">{initials}</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
        
        {/* Badge de estado flotante */}
        <div className={`absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-bold border ${statusConfig.border} bg-slate-900/80 backdrop-blur-sm ${statusConfig.text}`}>
          {vehicle.status || "N/A"}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-white text-lg leading-tight group-hover:text-cyan-400 transition-colors">
            {vehicle.make} {vehicle.model}
          </h3>
          <span className="text-sm font-bold text-slate-400">{vehicle.year}</span>
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-0.5 rounded bg-slate-700/50 text-xs text-slate-300 border border-slate-600/30 font-mono">
            {vehicle.plate || "Sin patente"}
          </span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-700/30">
          <span className="text-xs text-slate-500">ID: {vehicle.id || vehicle.vehicle_id}</span>
          <span className="text-xs text-cyan-400 font-medium group-hover:translate-x-1 transition-transform flex items-center gap-1">
            Ver detalle →
          </span>
        </div>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 backdrop-blur-md border border-cyan-500/30 rounded-xl p-3 shadow-2xl">
        <p className="text-slate-300 text-sm font-medium mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-400">{entry.name}:</span>
            <span className="text-white font-bold">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export const Dashboard = () => {
  const { user, company } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    salesTotal: 0,
    profitTotal: 0,
    salesCount: 0,
    expensesTotal: 0,
    expensesCount: 0,
    profitMargin: 0,
    stockP: 0,
    stockC: 0,
    valorStockP: 0,
    valorStockC: 0,
    avgP: 0,
    avgC: 0,
  });

  const [vehiclesByStatus, setVehiclesByStatus] = useState({});
  const [lots, setLots] = useState([]);
  const [alerts, setAlerts] = useState({});
  const [evolution, setEvolution] = useState([]);
  const [recentVehicles, setRecentVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [tempDateRange, setTempDateRange] = useState({ from: "", to: "" });

  useEffect(() => {
    const currentDate = new Date();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const defaultRange = {
      from: firstDay.toISOString().split("T")[0],
      to: lastDay.toISOString().split("T")[0],
    };

    setDateRange(defaultRange);
    setTempDateRange(defaultRange);
    loadDashboardData(defaultRange);
  }, []);

  const loadDashboardData = async (params = {}) => {
    try {
      setLoading(true);

      const currentDate = new Date();
      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const queryParams = {
        resource: "all",
        date_from: params.date_from || firstDay.toISOString().split("T")[0],
        date_to: params.date_to || lastDay.toISOString().split("T")[0],
        ...params,
      };

      const response = await api.get("/api_dashboard/", { params: queryParams });

      if (response.data.success) {
        const data = response.data.data || {};
        const kpis = data.kpis || {};

        setStats({
          salesTotal: kpis.sales_total || 0,
          profitTotal: kpis.profit_total || 0,
          salesCount: kpis.sales_count || 0,
          expensesTotal: kpis.expenses_total || 0,
          expensesCount: kpis.expenses_count || 0,
          profitMargin: kpis.profit_margin || 0,
          stockP: kpis.stock_p || 0,
          stockC: kpis.stock_c || 0,
          valorStockP: kpis.valor_stock_p || 0,
          valorStockC: kpis.valor_stock_c || 0,
          avgP: kpis.avg_p || 0,
          avgC: kpis.avg_c || 0,
        });

        setVehiclesByStatus(kpis.vehicles_by_status || {});
        setLots(data.lots || []);
        setAlerts(data.alerts || {});
        setEvolution(data.evolution || []);

        const vehiclesRes = await api.get("/api_vehicles/");
        if (vehiclesRes.data.success) {
          const vehicles = vehiclesRes.data.data || [];
          const filtered = vehicles
            .filter((vehicle) => vehicle.status?.toLowerCase() !== "sold")
            .slice(0, 6);
          setRecentVehicles(filtered);
        }
      }
    } catch (error) {
      console.error("Dashboard error:", error);
      toast.error("Error al cargar datos del dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (field, value) => {
    setTempDateRange((prev) => ({ ...prev, [field]: value }));
  };

  const applyDateFilter = () => {
    if (!tempDateRange.from || !tempDateRange.to) {
      toast.error("Debe seleccionar fecha inicio y fin");
      return;
    }
    if (new Date(tempDateRange.from) > new Date(tempDateRange.to)) {
      toast.error("La fecha inicio debe ser anterior a la fecha fin");
      return;
    }
    setDateRange(tempDateRange);
    loadDashboardData(tempDateRange);
  };

  const resetDateFilter = () => {
    const currentDate = new Date();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const defaultRange = {
      from: firstDay.toISOString().split("T")[0],
      to: lastDay.toISOString().split("T")[0],
    };
    setTempDateRange(defaultRange);
    setDateRange(defaultRange);
    loadDashboardData(defaultRange);
  };

  const setPresetRange = (preset) => {
    const today = new Date();
    let from, to;

    switch (preset) {
      case "today":
        from = to = today.toISOString().split("T")[0];
        break;
      case "week":
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        from = weekStart.toISOString().split("T")[0];
        to = today.toISOString().split("T")[0];
        break;
      case "month":
        from = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
        to = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split("T")[0];
        break;
      case "year":
        from = new Date(today.getFullYear(), 0, 1).toISOString().split("T")[0];
        to = new Date(today.getFullYear(), 11, 31).toISOString().split("T")[0];
        break;
      default:
        return;
    }

    const range = { from, to };
    setTempDateRange(range);
    setDateRange(range);
    loadDashboardData(range);
  };

  // Datos para gráfico de evolución
  const evolutionChartData = evolution.map((item) => ({
    name: item.label,
    Vendidos: item.sold || 0,
    Ingresados: item.in || 0,
  }));

  return (
    <div className="space-y-8 p-2">
      {/* ============================================
          HEADER HERO
          ============================================ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-8 bg-gradient-to-b from-cyan-400 to-indigo-500 rounded-full" />
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              ¡Bienvenido, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">{user?.name}</span>!
            </h1>
          </div>
          <p className="text-slate-400 text-lg ml-5">
            {company?.business_name || "Panel de Control Multiempresa"}
          </p>
        </div>
      </div>

      {/* ============================================
          FILTRO DE FECHAS
          ============================================ */}
      <div className="rounded-2xl bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <span className="text-xl">📅</span>
            <span>Período</span>
          </div>

          {/* Presets */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: "today", label: "Hoy" },
              { key: "week", label: "Esta Semana" },
              { key: "month", label: "Este Mes" },
              { key: "year", label: "Este Año" },
            ].map((preset) => (
              <button
                key={preset.key}
                onClick={() => setPresetRange(preset.key)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-700/50 text-slate-300 border border-slate-600/30 hover:bg-cyan-500/20 hover:text-cyan-400 hover:border-cyan-500/30 transition-all"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="h-px lg:h-8 lg:w-px bg-slate-700/50" />

          {/* Inputs manuales */}
          <div className="flex flex-wrap items-end gap-3 flex-1">
            <div>
              <label className="block text-xs text-slate-500 font-medium mb-1.5 uppercase tracking-wider">Desde</label>
              <input
                type="date"
                value={tempDateRange.from}
                onChange={(e) => handleDateChange("from", e.target.value)}
                className="px-3 py-2 bg-slate-900/80 border border-slate-600/50 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 font-medium mb-1.5 uppercase tracking-wider">Hasta</label>
              <input
                type="date"
                value={tempDateRange.to}
                onChange={(e) => handleDateChange("to", e.target.value)}
                className="px-3 py-2 bg-slate-900/80 border border-slate-600/50 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={applyDateFilter}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white rounded-xl text-sm font-bold hover:from-cyan-400 hover:to-indigo-500 transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
              >
                Aplicar
              </button>
              <button
                onClick={resetDateFilter}
                className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-xl text-sm font-bold border border-slate-600/30 hover:bg-slate-600/50 transition-all"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-4 font-mono">
          {formatDate(dateRange.from)} — {formatDate(dateRange.to)}
        </p>
      </div>

      {/* ============================================
          KPIs PRINCIPALES
          ============================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Ventas Totales"
          value={formatMoney(stats.salesTotal)}
          color="from-emerald-500 to-emerald-700"
          icon="💰"
          trend="up"
          trendValue="12%"
        />
        <StatCard
          title="Ganancia Total"
          value={formatMoney(stats.profitTotal)}
          color="from-cyan-500 to-cyan-700"
          icon="📈"
          trend="up"
          trendValue="8%"
        />
        <StatCard
          title="Gastos del Mes"
          value={formatMoney(stats.expensesTotal)}
          color="from-rose-500 to-rose-700"
          icon="💸"
          trend="down"
          trendValue="3%"
        />
        <StatCard
          title="Margen Real"
          value={`${stats.profitMargin.toFixed(2)}%`}
          color={stats.profitMargin > 0 ? "from-sky-500 to-sky-700" : "from-amber-500 to-amber-700"}
          icon="📊"
        />
      </div>

      {/* ============================================
          PROPIOS vs CONSIGNADOS
          ============================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Propios */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-md border border-orange-500/20 p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-500 to-amber-600" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl" />
          
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-xl shadow-lg">
              🚗
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Stock Propios</h3>
              <p className="text-xs text-slate-500">Vehículos de propiedad directa</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30 text-center">
              <div className="text-2xl font-bold text-orange-400 mb-1">{stats.stockP}</div>
              <div className="text-xs text-slate-500">Unidades</div>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30 text-center">
              <div className="text-lg font-bold text-orange-400 mb-1">{formatMoney(stats.valorStockP)}</div>
              <div className="text-xs text-slate-500">Valor</div>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30 text-center">
              <div className="text-2xl font-bold text-orange-400 mb-1">{stats.avgP}</div>
              <div className="text-xs text-slate-500">Días Prom.</div>
            </div>
          </div>
        </div>

        {/* Consignados */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-md border border-indigo-500/20 p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-600" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl" />
          
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl shadow-lg">
              🤝
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Stock Consignados</h3>
              <p className="text-xs text-slate-500">Vehículos en consignación</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30 text-center">
              <div className="text-2xl font-bold text-indigo-400 mb-1">{stats.stockC}</div>
              <div className="text-xs text-slate-500">Unidades</div>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30 text-center">
              <div className="text-lg font-bold text-indigo-400 mb-1">{formatMoney(stats.valorStockC)}</div>
              <div className="text-xs text-slate-500">Valor</div>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30 text-center">
              <div className="text-2xl font-bold text-indigo-400 mb-1">{stats.avgC}</div>
              <div className="text-xs text-slate-500">Días Prom.</div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================
          INVENTARIO POR ESTADO
          ============================================ */}
      {Object.keys(vehiclesByStatus).length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-sm shadow-lg">
              📊
            </div>
            <h2 className="text-xl font-bold text-white">Inventario por Estado</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(vehiclesByStatus).map(([status, data]) => (
              <StatusCard
                key={status}
                status={status}
                data={data}
                onClick={() => navigate(`/vehicles?status=${status}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ============================================
          LOTES
          ============================================ */}
      {lots.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-sm shadow-lg">
                🏪
              </div>
              <h2 className="text-xl font-bold text-white">Inventario por Lotes</h2>
            </div>
            <span className="text-sm text-slate-500 font-mono bg-slate-800/50 px-3 py-1 rounded-lg border border-slate-700/30">
              Total: {lots.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lots.map((lot) => (
              <LotCard key={lot.lot_id} lot={lot} />
            ))}
          </div>
        </div>
      )}

      {/* ============================================
          ALERTAS
          ============================================ */}
      {alerts?.oldest_car && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-900/30 to-amber-900/30 border border-rose-500/20 p-6 shadow-xl">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-rose-500 to-amber-500" />
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-rose-500/10 rounded-full blur-2xl animate-pulse" />
          
          <div className="relative z-10 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-2xl shadow-lg animate-pulse">
              ⚠️
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-rose-400 mb-2">Alerta de Stock</h3>
              <div className="bg-slate-900/40 rounded-xl p-4 border border-rose-500/10">
                <p className="text-white font-medium text-lg">
                  {alerts.oldest_car.desc}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-1 rounded bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/20">
                    {alerts.oldest_car.days} días en stock
                  </span>
                  <span className="text-slate-500 text-xs">Revisar urgente</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================
          EVOLUCIÓN MENSUAL (GRÁFICO)
          ============================================ */}
      {evolution.length > 0 && (
        <div className="rounded-2xl bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-sm shadow-lg">
              📈
            </div>
            <h2 className="text-xl font-bold text-white">Evolución Mensual</h2>
          </div>
          
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolutionChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b" 
                  fontSize={12} 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={12} 
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="Vendidos"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorSold)"
                />
                <Area
                  type="monotone"
                  dataKey="Ingresados"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorIn)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ============================================
          VEHÍCULOS RECIENTES (CARDS)
          ============================================ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-sm shadow-lg">
              🚙
            </div>
            <h2 className="text-xl font-bold text-white">Vehículos Recientes</h2>
          </div>
          <button
            onClick={() => navigate("/vehicles")}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white rounded-xl text-sm font-bold hover:from-cyan-400 hover:to-indigo-500 transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 flex items-center gap-2"
          >
            Ver Todos →
          </button>
        </div>

        {recentVehicles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id || vehicle.vehicle_id}
                vehicle={vehicle}
                onClick={() => navigate(`/vehicles/edit/${vehicle.id || vehicle.vehicle_id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-12 text-center">
            <div className="text-4xl mb-3">🚗</div>
            <p className="text-slate-400">No hay vehículos disponibles</p>
          </div>
        )}
      </div>
    </div>
  );
};