import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { useAuth } from "./hooks/useAuth";

// Layouts y Páginas
import MainLayout from "./layouts/MainLayout";
import LoginPage from "./pages/LoginPage";
import VehicleList from "./components/VehicleList";
import VehicleForm from "./components/VehicleForm";
import LotList from "./components/lotes/LotList";
import LotForm from "./components/lotes/LotForm";
import VehicleExpensesPage from './pages/VehicleExpensesPage';
import ClientList from "./components/clients/ClientList";
import ClientForm from "./components/clients/ClientForm";
import QuoteForm from "./components/quotes/QuoteForm";
import QuoteList from "./components/quotes/QuoteList";
import QuoteView from "./components/quotes/QuoteView";

// Componente Wrapper para rutas protegidas
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="p-10 text-center">Cargando sesión...</div>;
  
  // Si no hay usuario, mandamos al login
  return user ? children : <Navigate to="/login" replace />;
};

// Un Dashboard simple de bienvenida (Opcional)
const DashboardHome = () => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Bienvenido al Panel de Control</h3>
            <p className="mt-1 text-sm text-gray-500">
                Selecciona una opción del menú superior para comenzar a gestionar tu concesionaria.
            </p>
            {/* Aquí luego pondremos gráficas de ventas */}
        </div>
    </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 1. Ruta Pública (Login) */}
          <Route path="/login" element={<LoginPage />} />

          {/* 2. Rutas Privadas (Envueltas en Layout y PrivateRoute) */}
          {/* El PrivateRoute protege TODO lo que está adentro */}
          <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
            
            {/* Redirección inicial */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Tablero Principal */}
            <Route path="/dashboard" element={<DashboardHome />} />

            {/* Módulo de Vehículos */}
            <Route path="/vehicles" element={<VehicleList />} />
            <Route path="/vehicles/new" element={<VehicleForm />} />
            <Route path="/vehicles/edit/:id" element={<VehicleForm />} />
            <Route path="/vehicles/:id/expenses" element={<VehicleExpensesPage />} />

            {/* Módulo de Lotes */}
            <Route path="/lots" element={<LotList />} />
            <Route path="/lots/new" element={<LotForm />} />
            <Route path="/lots/edit/:id" element={<LotForm />} />
            {/*cotizaciones */}
            <Route path="/quotes" element={<QuoteList />} />
            <Route path="/quotes/new" element={<QuoteForm />} />
            <Route path="/quotes/view/:id" element={<QuoteView />} />


            {/* clientes*/}
          <Route path="/clients" element={<PrivateRoute><ClientList /></PrivateRoute>} />
          <Route path="/clients/new" element={<PrivateRoute><ClientForm /></PrivateRoute>} />
          <Route path="/clients/edit/:id" element={<PrivateRoute><ClientForm /></PrivateRoute>} />
          </Route>

          {/* 3. Catch-all (Cualquier ruta rara va al dashboard) */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;