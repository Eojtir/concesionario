/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider';
import {
  FiMapPin,
  FiUsers,
  FiFileText,
  FiDollarSign,
  FiSettings,
  FiLogOut,
  FiHome,
  FiTruck,
  FiGrid,
  FiChevronDown,
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const menuItems = {
  general: [
    { icon: FiHome, label: 'Dashboard', path: '/dashboard', roles: ['admin', 'seller', 'finance', 'superadmin'] },
    { icon: FiDollarSign, label: 'Gastos', path: '/gastos', roles: ['admin', 'seller', 'finance', 'superadmin'] },
    { icon: FiTruck, label: 'Vehículos', path: '/vehicles', roles: ['admin', 'seller', 'superadmin'] },
    { icon: FiUsers, label: 'Clientes', path: '/clients', roles: ['admin', 'seller', 'superadmin'] },
    { icon: FiFileText, label: 'Cotizaciones', path: '/quotes', roles: ['admin', 'seller', 'superadmin'] },
    {
      icon: FiGrid,
      label: 'Auxiliares',
      roles: ['admin', 'seller', 'finance', 'superadmin'],
      children: [
        { icon: FiMapPin, label: 'Lotes', path: '/lots', roles: ['admin', 'seller', 'superadmin'] },
        { icon: FiDollarSign, label: 'Categorías de Gastos', path: '/gastos/categorias', roles: ['seller', 'admin', 'finance', 'superadmin'] },
        { icon: FiFileText, label: 'Listado de autos', path: '/catalogo', roles: ['admin', 'seller', 'superadmin'] },
        { icon: FiFileText, label: 'Gastos y Trámites de Venta', path: '/gastos-venta', roles: ['admin', 'seller', 'finance', 'superadmin'] },
      ],
    },
  ],
  financial: [
    { icon: FiDollarSign, label: 'Ventas', path: '/sales', roles: ['admin', 'finance', 'superadmin'] },
    { icon: FiSettings, label: 'Configuración', path: '/settings', roles: ['admin', 'superadmin'] },
  ],
  admin: [
    { icon: FiFileText, label: 'Empresas', path: '/admin/companies', roles: ['superadmin'] },
  ],
};

// Recibe isCollapsed desde el MainLayout
export const Sidebar = ({ isOpen, onClose, isCollapsed }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [openGroups, setOpenGroups] = useState({});

  // Si no hay usuario, no renderizamos nada
  if (!user) return null;

  // El estado 'expanded' ahora depende de lo que diga el padre (MainLayout)
  const expanded = !isCollapsed;

  const getFilteredMenu = () => {
    const allItems = [...menuItems.general, ...menuItems.financial, ...menuItems.admin];
    return allItems.filter((item) => {
      // Si es grupo, mostrar si al menos un hijo tiene permiso
      if (item.children) {
        return item.children.some((child) => child.roles.includes(user.role));
      }
      return item.roles.includes(user.role);
    });
  };

  const filteredMenu = getFilteredMenu();

  const toggleGroup = (label) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isChildActive = (children) => {
    return children?.some((child) => location.pathname === child.path);
  };

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada correctamente');
    navigate('/login');
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (onClose) onClose(); // Para cerrar el menú en móviles
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo Section */}
      <div className="flex items-center px-4 py-6 border-b border-cyan-500/20 min-h-[80px]">
        <div className="flex items-center justify-center min-w-[40px]">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-indigo-600 rounded-lg shadow-lg shadow-cyan-500/20" />
        </div>
        <AnimatePresence>
          {expanded && (
            <motion.span
              className="ml-3 text-xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent whitespace-nowrap overflow-hidden"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {filteredMenu.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          const hasChildren = !!item.children;
          const groupActive = hasChildren ? isChildActive(item.children) : false;
          const isGroupOpen = openGroups[item.label] || false;

          // Renderizar hijos filtrados por rol
          const visibleChildren = hasChildren
            ? item.children.filter((child) => child.roles.includes(user.role))
            : [];

          if (hasChildren && visibleChildren.length === 0) return null;

          return (
            <div key={item.label} className="relative group">
              {/* Botón principal del item o grupo */}
              <motion.button
                onClick={() => {
                  if (hasChildren && expanded) {
                    toggleGroup(item.label);
                  } else if (!hasChildren) {
                    handleNavigate(item.path);
                  }
                }}
                className={`w-full flex items-center p-3 rounded-xl transition-all relative
                  ${isActive || groupActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-gray-400 hover:bg-slate-700/50 hover:text-white border border-transparent'
                  }`}
                whileHover={{ x: 4 }}
              >
                <div className="flex items-center justify-center min-w-[32px]">
                  <Icon
                    className={`w-5 h-5 ${isActive || groupActive ? 'drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' : ''}`}
                  />
                </div>

                <AnimatePresence>
                  {expanded && (
                    <motion.span
                      className="ml-3 text-sm font-medium whitespace-nowrap flex-1 text-left"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Chevron para grupos cuando está expandido */}
                {expanded && hasChildren && (
                  <motion.div
                    animate={{ rotate: isGroupOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FiChevronDown className="w-4 h-4 text-gray-400" />
                  </motion.div>
                )}

                {/* Tooltip pequeño cuando está colapsado (items simples) */}
                {!expanded && !hasChildren && (
                  <div className="absolute left-16 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity border border-cyan-500/20 whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </motion.button>

              {/* Submenú acordeón cuando está expandido */}
              <AnimatePresence>
                {expanded && hasChildren && isGroupOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden ml-2 mt-1 space-y-1"
                  >
                    <div className="pl-4 border-l border-cyan-500/20 ml-4 space-y-1 py-1">
                      {visibleChildren.map((child) => {
                        const ChildIcon = child.icon;
                        const childActive = location.pathname === child.path;
                        return (
                          <motion.button
                            key={child.path}
                            onClick={() => handleNavigate(child.path)}
                            className={`w-full flex items-center p-2 rounded-lg transition-all text-xs
                              ${childActive
                                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                                : 'text-gray-400 hover:bg-slate-700/50 hover:text-white border border-transparent'
                              }`}
                            whileHover={{ x: 3 }}
                          >
                            <div className="flex items-center justify-center min-w-[24px]">
                              <ChildIcon className="w-4 h-4" />
                            </div>
                            <span className="ml-2 font-medium whitespace-nowrap">{child.label}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Menú flotante cuando está colapsado y es grupo */}
              {!expanded && hasChildren && (
                <div className="absolute left-full top-0 ml-2 bg-slate-800 border border-cyan-500/20 rounded-xl p-2 min-w-[190px] shadow-xl z-50 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity">
                  <div className="text-xs font-semibold text-cyan-400 px-3 py-2 border-b border-cyan-500/10 mb-1 uppercase tracking-wider">
                    {item.label}
                  </div>
                  {visibleChildren.map((child) => {
                    const ChildIcon = child.icon;
                    const childActive = location.pathname === child.path;
                    return (
                      <button
                        key={child.path}
                        onClick={() => handleNavigate(child.path)}
                        className={`w-full flex items-center px-3 py-2 rounded-lg text-xs transition-all mt-1
                          ${childActive
                            ? 'bg-cyan-500/10 text-cyan-400'
                            : 'text-gray-400 hover:bg-slate-700/50 hover:text-white'
                          }`}
                      >
                        <ChildIcon className="w-4 h-4 mr-2" />
                        {child.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      {/* <div className="p-4 border-t border-cyan-500/20">
        <button
          onClick={handleLogout}
          className="w-full flex items-center p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all group"
        >
          <div className="flex items-center justify-center min-w-[32px]">
            <FiLogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </div>
          {expanded && (
            <motion.span
              className="ml-3 text-sm font-medium whitespace-nowrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              Cerrar Sesión
            </motion.span>
          )}
        </button>
      </div> */}
    </div>
  );

  return (
    <>
      {/* Desktop View */}
      <div className="hidden lg:flex lg:flex-col h-full">
        <SidebarContent />
      </div>

      {/* Mobile View */}
      <div className="lg:hidden h-full">
        <SidebarContent />
      </div>
    </>
  );
};