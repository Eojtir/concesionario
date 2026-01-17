import api from './api';

const authService = {
  // Login: Enviamos email y pass, recibimos token y user
  login: async (email, password) => {
    // La URL se concatena a la baseURL definida en api.js
    const response = await api.post('/api_auth/?action=login', { 
      email, 
      password 
    });
    
    if (response.data.token) {
      // Guardamos sesión en localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  // Logout: Limpiamos todo
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  // Obtener usuario actual del storage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
  }
};

export default authService; // <--- ESTA LÍNEA ES CRUCIAL