import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error de carga en módulo:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
          <h2 className="text-2xl font-bold mb-4 text-red-500">¡Ups! Algo salió mal.</h2>
          <p className="text-slate-400 mb-6 text-center">No se pudo cargar la sección. Por favor, revisa tu conexión.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors font-medium"
          >
            Recargar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;