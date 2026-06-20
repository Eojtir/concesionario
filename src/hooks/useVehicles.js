import { useState, useCallback } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVehicles = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);

    try {
      let url = "/api_vehicles/";
      const params = new URLSearchParams();

      if (filters.status) params.append("status", filters.status);
      if (filters.lot_id) params.append("lot_id", filters.lot_id);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await api.get(url);

      if (res.data.success) {
        setVehicles(res.data.data || []);
        return res.data.data || [];
      } else {
        throw new Error(res.data.message || "Error al cargar vehículos");
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createVehicle = useCallback(
    async (vehicleData) => {
      setLoading(true);
      setError(null);

      try {
        const res = await api.post("/api_vehicles/", vehicleData);

        if (res.data.success) {
          toast.success("Vehículo creado exitosamente");
          await fetchVehicles();
          return res.data.data?.vehicle_id;
        } else {
          throw new Error(res.data.message || "Error al crear vehículo");
        }
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchVehicles],
  );

  const updateVehicle = useCallback(
    async (id, vehicleData) => {
      setLoading(true);
      setError(null);

      try {
        const res = await api.put(`/api_vehicles/?id=${id}`, vehicleData);

        if (res.data.success) {
          toast.success("Vehículo actualizado exitosamente");
          await fetchVehicles();
          return true;
        } else {
          throw new Error(res.data.message || "Error al actualizar vehículo");
        }
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchVehicles],
  );

  const deleteVehicle = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);

      try {
        const res = await api.delete(`/api_vehicles/?id=${id}`);

        if (res.data.success) {
          toast.success("Vehículo eliminado exitosamente");
          await fetchVehicles();
          return true;
        } else {
          throw new Error(
            res.data.message || "No se puede eliminar el vehículo",
          );
        }
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchVehicles],
  );

  const getVehicleById = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get(`/api_vehicles/?id=${id}`);

      if (res.data.success) {
        return res.data.data;
      } else {
        throw new Error(res.data.message || "Vehículo no encontrado");
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    vehicles,
    loading,
    error,
    fetchVehicles,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    getVehicleById,
  };
};



//