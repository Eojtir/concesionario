export const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-cyan-400 mb-4">401</h1>
        <h2 className="text-2xl text-white mb-4">Acceso Denegado</h2>
        <p className="text-gray-400 mb-6">
          No tienes permisos para acceder a esta sección.
        </p>
        <button
          onClick={() => window.history.back()}
          className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white rounded-lg"
        >
          Volver atrás
        </button>
      </div>
    </div>
  );
};