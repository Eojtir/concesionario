import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';

// Contextos (Estos deben cargarse al inicio sí o sí)
import { AuthProvider } from "./context/AuthProvider";
import { CompanyProvider } from "./context/CompanyContext";

// Componentes UI Críticos
import { Loading } from "./components/ui/Loading";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import { ProtectedRoute } from "./components/router/ProtectedRoute";
// --- LAZY LOADING DE MÓDULOS ---
// Usamos .then() para manejar Named Exports (ej: export const MainLayout)

// Layouts & Auth
const MainLayout = lazy(() => import("./layouts/MainLayout").then(m => ({ default: m.MainLayout })));
const Login = lazy(() => import("./pages/Login")); // Default export
const Dashboard = lazy(() => import("./pages/Dashboard").then(m => ({ default: m.Dashboard })));

// Módulo Vehículos
const VehicleList = lazy(() => import("./components/vehicles/VehicleList"));
const VehicleForm = lazy(() => import("./components/vehicles/VehicleWizard"));
const VehicleExpensesPage = lazy(() => import("./pages/VehicleExpensesPage"));

//modulo catalogos 

const Catalogos = lazy(() => import("./components/catalogs/CatalogManager"));


// Módulo Lotes
const LotList = lazy(() => import("./components/lotes/LotList"));
const LotForm = lazy(() => import("./components/lotes/LotForm"));

// Módulo Clientes
const ClientList = lazy(() => import("./components/clients/ClientList"));
const ClientForm = lazy(() => import("./components/clients/ClientForm"));

// Módulo Directorio de Personas
const PersonDirectory = lazy(() => import("./components/directory/PersonDirectory"));

// Módulo Cotizaciones
const QuoteList = lazy(() => import("./components/quotes/QuoteList"));
const QuoteForm = lazy(() => import("./components/quotes/QuoteForm"));
const QuoteView = lazy(() => import("./components/quotes/QuoteView"));

// Módulo Gastos y Trámites de Venta
const ExpenseSaleVentaDashboard = lazy(() => import("./components/expenses-sale/ExpenseSaleDashboard"));


// Módulo Ventas
const SaleForm = lazy(() => import("./components/sales/SaleForm"));

// Módulo Gastos
const ExpenseDashboard = lazy(() => import("./components/expenses/ExpenseDashboard"));
const ExpenseCategoryDashboard = lazy(() => import("./components/expenses/category/ExpenseCategoryDashboard"));

// Admin & Errores
const CompaniesManagement = lazy(() => import("./pages/admin/CompaniesManagement").then(m => ({ default: m.CompaniesManagement })));
const Unauthorized = lazy(() => import("./pages/Unauthorized").then(m => ({ default: m.Unauthorized })));
const NotFound = lazy(() => import("./pages/NotFound").then(m => ({ default: m.NotFound })));
const CompanySuspended = lazy(() => import("./pages/CompanySuspended").then(m => ({ default: m.CompanySuspended })));

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CompanyProvider>
          <BrowserRouter>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1e293b',
                  color: '#fff',
                  border: '1px solid #06b6d4',
                },
              }}
            />
            
            {/* Suspense muestra tu Loading mientras se descargan los chunks JS */}
            <Suspense fallback={<Loading />}>
              <Routes>
                {/* --- Rutas Públicas --- */}
                <Route path="/login" element={<Login />} />

                {/* --- Rutas Privadas (Usuarios Logueados) --- */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<MainLayout />}>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />

                    {/* Vehículos */}
                    <Route path="/vehicles" element={<VehicleList />} />
                    <Route path="/vehicles/new" element={<VehicleForm />} />
                    <Route path="/vehicles/edit/:id" element={<VehicleForm />} />
                    <Route path="/vehicles/:id/expenses" element={<VehicleExpensesPage />} />

                    {/**Catalogos */}

                    <Route path="/catalogo" element={<Catalogos />} />

                    {/* Gastos y Trámites de Venta */}
                    <Route path="/gastos-venta" element={<ExpenseSaleVentaDashboard />} />

                    {/* Ventas */}

                    <Route path="/sales/new" element={<SaleForm />} />


                    {/* Lotes */}
                    <Route path="/lots" element={<LotList />} />
                    <Route path="/lots/new" element={<LotForm />} />
                    <Route path="/lots/edit/:id" element={<LotForm />} />

                    {/* Clientes */}
                    <Route path="/clients" element={<PersonDirectory />} />
                    <Route path="/clients/new" element={<ClientForm />} />
                    <Route path="/clients/edit/:id" element={<ClientForm />} />

                    {/* Directorio de Personas */}
                    <Route path="/directory" element={<PersonDirectory />} />

                    {/* Cotizaciones */}
                    <Route path="/quotes" element={<QuoteList />} />
                    <Route path="/quotes/new/:vehicle_id" element={<QuoteForm />} />
                    <Route path="/quotes/new" element={<QuoteForm />} />
                    <Route path="/quotes/view/:id" element={<QuoteView />} />

                    {/**gastos */}
                    <Route path="/gastos" element={<ExpenseDashboard />} />
                    <Route path="/admin/companies" element={<CompaniesManagement />} />

                    {/**categoria de gastos */}
                    <Route path="/gastos/categorias" element={<ExpenseCategoryDashboard />} />

                  </Route>
                  
                </Route>

                {/* --- Rutas SuperAdmin --- */}
                <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
                  <Route element={<MainLayout />}>
                  </Route>
                </Route>

                {/* --- Rutas de Error --- */}
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="/company-suspended" element={<CompanySuspended />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </CompanyProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;