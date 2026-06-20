export const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-purple-400 mb-4">404</h1>
        <h2 className="text-2xl text-white mb-4">Página No Encontrada</h2>
        <p className="text-gray-400 mb-6">
          La ruta que buscas no existe en el sistema.
        </p>
        <a
          href="/dashboard"
          className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg"
        >
          Ir al Dashboard
        </a>
      </div>
    </div>
  );
};