import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthProvider";
import toast from "react-hot-toast";

export const CompanyContext = createContext();

export const CompanyProvider = ({ children }) => {
  const { user } = useAuth();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCompanyData = async () => {
    if (!user?.company_id) {
      setCompany(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get(`/api_company/?id=${user.company_id}`);
      if (res.data.success) {
        setCompany(res.data.data);
      } else {
        toast.error("No se pudo cargar información de la empresa");
      }
    } catch (error) {
      console.error("Error cargando empresa:", error);
      toast.error("Error de conexión al cargar empresa");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyData();
  }, [user?.company_id]);

  const updateCompany = async (data) => {
    try {
      const res = await api.put(`/api_company/?id=${user.company_id}`, data);
      if (res.data.success) {
        await fetchCompanyData(); // Recargar datos
        toast.success("Empresa actualizada exitosamente");
        return true;
      }
    } catch (error) {
      toast.error("Error al actualizar empresa");
    }
    return false;
  };

  return (
    <CompanyContext.Provider value={{ company, loading, updateCompany }}>
      {children}
    </CompanyContext.Provider>
  );
};

// Hook personalizado
export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw newError("useCompany debe usarse dentro de CompanyProvider");
  }
  return context;
};
