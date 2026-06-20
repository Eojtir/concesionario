// ============================================
// src/components/vehicles/VehicleCard.jsx
// ============================================
import React from "react";
import { FiEdit2, FiTrash2, FiTool, FiFileText, FiDollarSign } from "react-icons/fi";
import { formatMoney } from "../../utils/formatters";

const STATUS_CONFIG = {
  available: {
    text: "Disponible",
    class: "bg-slate-500/20 text-black/50 border-gray-500/80",
    gradient: "from-emerald-500 to-emerald-700",
    dot: "bg-emerald-400",
  },
  reserved: {
    text: "Reservado",
    class: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    gradient: "from-amber-500 to-amber-700",
    dot: "bg-amber-400",
  },
  maintenance: {
    text: "Mantenimiento",
    class: "bg-slate-500/20 text-slate-400 border-slate-500/30",
    gradient: "from-slate-500 to-slate-700",
    dot: "bg-slate-400",
  },
};

const VehicleCard = ({ vehicle, onEdit, onExpenses, onQuote, onSell, onDelete }) => {
  const config = STATUS_CONFIG[vehicle.status] || STATUS_CONFIG.available;
  const initials = `${vehicle.make?.[0] || ""}${vehicle.model?.[0] || ""}`.toUpperCase();

  const getImageUrl = () => {
    if (vehicle.image) return vehicle.image;
    if (vehicle.photo) return vehicle.photo;
    if (vehicle.photo_url) return vehicle.photo_url;
    if (vehicle.img) return vehicle.img;
    return null;
  };

  const imageUrl = getImageUrl();

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-slate-800/60 backdrop-blur-md border border-slate-700/50 hover:border-cyan-500/40 transition-all duration-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:-translate-y-0.5">
      {/* Imagen o Placeholder */}
      <div className="relative h-44 overflow-hidden">
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
          className={`absolute inset-0 bg-gradient-to-br ${config.gradient} flex items-center justify-center ${imageUrl ? "hidden" : "flex"}`}
        >
          <span className="text-5xl font-bold text-white/30">{initials}</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-80" />

        {/* Badge de estado flotante */}
        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-bold border backdrop-blur-sm ${config.class}`}>
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${config.dot} mr-1.5`} />
          {config.text}
        </div>

        {/* Precio flotante */}
        <div className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-cyan-500/20">
          <span className="text-cyan-400 font-bold text-sm">
            {formatMoney(vehicle.sale_price)}
          </span>
        </div>
              <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-cyan-500/20">
            <span className="text-white font-mono font-bold text-md tracking-widest">
              {vehicle.plate || "SIN PLACA"}
            </span>
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

        {/* PLATE RESALTADO - eliminamos VIN */}
        
        {/* <div className="mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
            <span className="text-cyan-400 text-xs font-bold uppercase tracking-wider">Patente</span>
            <span className="text-white font-mono font-bold text-lg tracking-widest">
              {vehicle.plate || "SIN PLACA"}
            </span>
          </div>
        </div> */}
        

        {/* 
        // GANANCIA OCULTADA - descomentar para mostrar
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs text-slate-500">
            Costo: <span className="text-slate-300">{formatMoney(vehicle.purchase_price)}</span>
          </div>
          <div className="text-xs text-slate-500">
            Ganancia: <span className="text-emerald-400 font-medium">
              {formatMoney((vehicle.sale_price || 0) - (vehicle.purchase_price || 0))}
            </span>
          </div>
        </div>
        */}

        {/* Costo solo (sin ganancia) */}
        {/* <div className="mb-4">
          <div className="text-xs text-slate-500">
            Costo: <span className="text-slate-300">{formatMoney(vehicle.purchase_price)}</span>
          </div>
        </div> */}

        {/* Barra de acciones */}
        <div className="grid grid-cols-5 gap-2 pt-3 border-t border-slate-700/30">
          <button
            onClick={() => onEdit(vehicle)}
            className="flex flex-col items-center gap-1 p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/25 hover:border-cyan-500/40 transition-all group/btn"
            title="Editar"
          >
            <FiEdit2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
            <span className="text-[10px] font-bold">Editar</span>
          </button>

          <button
            onClick={() => onExpenses(vehicle)}
            className="flex flex-col items-center gap-1 p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/25 hover:border-purple-500/40 transition-all group/btn"
            title="Gastos"
          >
            <FiTool className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
            <span className="text-[10px] font-bold">Gastos</span>
          </button>

          <button
            onClick={() => onQuote(vehicle)}
            className="flex flex-col items-center gap-1 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/25 hover:border-emerald-500/40 transition-all group/btn"
            title="Cotizar"
          >
            <FiFileText className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
            <span className="text-[10px] font-bold">Cotizar</span>
          </button>

          <button
            onClick={() => onSell(vehicle)}
            className="flex flex-col items-center gap-1 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/25 hover:border-amber-500/40 transition-all group/btn"
            title="Vender"
          >
            <FiDollarSign className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
            <span className="text-[10px] font-bold">Vender</span>
          </button>

          <button
            onClick={() => onDelete(vehicle)}
            className="flex flex-col items-center gap-1 p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/25 hover:border-rose-500/40 transition-all group/btn"
            title="Eliminar"
          >
            <FiTrash2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
            <span className="text-[10px] font-bold">Borrar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;