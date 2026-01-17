import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // Usando el hook que creamos antes

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = await login(form.email, form.password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-gray-100">
        <div className="text-center">
          {/* Aquí podrías poner tu Logo */}
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Bienvenido</h1>
          <p className="mt-2 text-sm text-gray-500">
            Ingresa tus credenciales para acceder al ERP
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4 border-l-4 border-red-500">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error de acceso</h3>
                  <div className="mt-1 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label htmlFor="email" className="sr-only">Correo Electrónico</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors"
                placeholder="nombre@empresa.com"
                value={form.email}
                onChange={(e) => setForm({...form, email: e.target.value})}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors"
                placeholder="Contraseña"
                value={form.password}
                onChange={(e) => setForm({...form, password: e.target.value})}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white 
                ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'}
                transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {loading ? 'Iniciando sesión...' : 'Ingresar al Sistema'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;