import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Usa la variable de entorno
  headers: {
    "Content-Type": "application/json",
    "X-App-Key": import.meta.env.VITE_APP_KEY,
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers["Authorization"] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manejo centralizado de errores
    if (error.response?.status === 401) {
      localStorage.clear();
      // Evitamos un loop infinito de recargas
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
