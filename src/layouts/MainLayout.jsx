import { useState } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { Sidebar } from '../components/ui/Sidebar';

// Definición de la URL Base del Backend (debería venir de tus variables de entorno)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.demo.com';

export const MainLayout = () => {
  const { user, company, logout } = useAuth();
  const navigate = useNavigate();
  
  // Estados de control de la interfaz
  const [isHovered, setIsHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!user) return <Navigate to="/login" replace />;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Construcción segura de la URL del logo
  const logoSrc = company?.logo_url ? `${API_BASE_URL}${company.logo_url}` : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-800 flex overflow-x-hidden">
      {/* --- SIDEBAR --- */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          fixed inset-y-0 left-0 z-30 
          bg-slate-800/95 
          transition-all duration-300 ease-in-out
          ${isHovered ? 'w-64' : 'w-20'} 
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          border-r border-cyan-500/20 backdrop-blur-md
        `}
        aria-label="Navegación lateral"
      >
        <Sidebar isCollapsed={!isHovered} />
      </aside>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div 
        className={`
          flex-1 flex flex-col 
          transition-all duration-300 ease-in-out
          ${isHovered ? 'lg:ml-64' : 'lg:ml-20'}
        `}
      >
        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-cyan-500/20 bg-slate-800/70 backdrop-blur-sm">
          
          {/* Botón menú móvil */}
          <button
            className="lg:hidden text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded-md"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
            aria-expanded={mobileOpen}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Bloque de Identidad Corporativa (Logo + Nombre) */}
          <div className="flex items-center space-x-3">
            {logoSrc && !imageError && (
              <img
                src={logoSrc}
                alt={`Logo de ${company?.business_name}`}
                className="shrink-0 h-8 md:h-10 w-auto object-contain"
                onError={() => setImageError(true)}
              />
            )}
            
            <span className="text-xl lg:text-xl font-bold bg-white bg-clip-text text-transparent truncate max-w-[150px] lg:max-w-none">
              {company?.business_name || 'Inverprado'}
            </span>
          </div>

          {/* Información de Usuario y Salida */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block text-right">
              <div className="text-sm font-medium text-white">{user?.name}</div>
              <div className="text-xs text-cyan-400/70">{user?.role}</div>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 lg:px-4 lg:py-2 text-sm text-white bg-gradient-to-r from-red-600 to-pink-600 rounded-lg shadow-lg hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              Salir
            </button>
          </div>
        </header>

        {/* Zona de Trabajo */}
        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Overlay Móvil */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-20 lg:hidden bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};