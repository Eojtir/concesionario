import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar sesión desde localStorage al iniciar
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          
          // Cargar datos de la empresa
          if (parsedUser.company_id) {
            await fetchCompanyData(parsedUser.company_id);
          }
        } catch (error) {
          console.error('Error al inicializar auth:', error);
          handleLogout();
        }
      }
      setLoading(false);
    };
    
    initAuth();
  }, []);

  // Obtener datos de la empresa
  const fetchCompanyData = async (companyId) => {
    try {
      const res = await api.get(`/api_company/?id=${companyId}`);
      
      // ✅ Verificar estructura de respuesta
      if (res.data?.success && res.data?.data) {
        setCompany(res.data.data);
      } else {
        toast.error('No se pudo cargar información de la empresa');
        setCompany(null);
      }
    } catch (error) {
      console.error('Error cargando empresa:', error);
      toast.error('Error de conexión');
      setCompany(null);
    }
  };

  // Login
  const handleLogin = async (email, password) => {
    try {
      const res = await api.post('/api_auth/?action=login', { email, password });
      
      // ✅ Verificar estructura exacta del backend
      if (res.data?.success && res.data?.data?.token && res.data?.data?.user) {
        const { token, user: userData } = res.data.data;
        
        // Guardar en localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
       
        setUser(userData);
        await fetchCompanyData(userData.company_id);
        
        toast.success(`¡Bienvenido, ${userData.name}!`);
        return { success: true, data: res.data.data };
      } else {
        toast.error(res.data?.message || 'Credenciales inválidas');
        return { success: false, message: res.data?.message || 'Error desconocido' };
      }
    } catch (error) {
      console.error('Error en login:', error);
      toast.error(error.response?.data?.message || 'Error al iniciar sesión');
      return { success: false, message: 'Error de conexión' };
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCompany(null);
    // ✅ NO usar navigate aquí - causa error
  };

  const value = {
    user,
    company,
    loading,
    login: handleLogin,
    logout: handleLogout,
    refreshCompany: () => user?.company_id && fetchCompanyData(user.company_id)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizado
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};