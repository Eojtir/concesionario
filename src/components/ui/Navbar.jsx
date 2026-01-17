import React from "react";
import { NavLink } from "react-router-dom"; // Usamos NavLink para estilos activos
import { useAuth } from "../../hooks/useAuth";

const Navbar = () => {
  const { user, logout } = useAuth();

  // Función para clases de enlaces (activo vs inactivo)
  const navLinkClass = ({ isActive }) =>
    isActive
      ? "border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200"
      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200";

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm fixed w-full z-10 top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo / Marca */}
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-blue-600 tracking-tight">
                AutoERP
              </span>
            </div>

            {/* Menú Principal */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NavLink to="/clients" className={navLinkClass}>
                Clientes
              </NavLink>
              <NavLink to="/dashboard" className={navLinkClass}>
                Tablero
              </NavLink>
              <NavLink to="/vehicles" className={navLinkClass}>
                Vehículos
              </NavLink>
              <NavLink to="/quotes" className={navLinkClass}>
                Cotización{" "}
              </NavLink>
              <NavLink to="/lots" className={navLinkClass}>
                Lotes
              </NavLink>
            </div>
          </div>
          {/* Menú Usuario */}
          <div className="flex items-center ml-6">
            <div className="flex flex-col text-right mr-4">
              <span className="text-sm font-medium text-gray-800">
                {user?.name}
              </span>
              <span className="text-xs text-gray-500 capitalize">
                {user?.role}
              </span>
            </div>
            <button
              onClick={logout}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition shadow-sm"
            >
              Salir
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
