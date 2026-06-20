import { useAuth } from "../context/AuthProvider";

export const CompanySuspended = () => {
  const { logout } = useAuth();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-400 mb-4">⛔</h1>
        <h2 className="text-2xl text-white mb-4">Empresa Suspendida</h2>
        <p className="text-gray-400 mb-6">
          Tu empresa ha sido suspendida. Contacta al administrador.
        </p>
        <button
          onClick={logout}
          className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};