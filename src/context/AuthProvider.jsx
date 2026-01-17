import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import api from '../services/api'; 

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null); 
  const [loading, setLoading] = useState(true);

  // Función para cargar datos de la empresa
  const fetchCompanyData = async () => {
    try {
      const res = await api.get('/api_company/');
      if (res.data.status === 'success') {
        setCompany(res.data.data);
      }
    } catch (error) {
      console.error("Error cargando datos de empresa", error);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = authService.getCurrentUser();
      if (storedUser) {
        setUser(storedUser);
        // Si hay usuario, cargamos los datos de su empresa
        await fetchCompanyData();
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    if (data.user) {
      setUser(data.user);
      await fetchCompanyData(); // Cargar empresa al loguearse
    }
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setCompany(null);
  };

  return (
    // Exponemos 'company' en el contexto
    <AuthContext.Provider value={{ user, company, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};