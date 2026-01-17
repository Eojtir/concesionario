import React, { useState, useEffect } from "react";
import lotService from "../../services/lotService";
import { useNavigate, useParams } from "react-router-dom";

const LotForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    capacity: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEditMode) {
      lotService
        .getById(id)
        .then(setFormData)
        .catch(() => setError("Error cargando lote"));
    }
  }, [id, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditMode) {
        await lotService.update(id, formData);
      } else {
        await lotService.create(formData);
      }
      navigate("/lots"); // Volver a la lista de lotes
    } catch (err) {
      setError("Error guardando el lote");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-8 rounded shadow mt-10">
      <h2 className="text-2xl font-bold mb-6">
        {isEditMode ? "Editar Lote" : "Crear Nuevo Lote"}
      </h2>
      {error && (
        <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nombre de la Sucursal
          </label>
          <input
            type="text"
            required
            value={formData.name || ""}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Dirección
          </label>
          <input
            type="text"
            value={formData.address || ""}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            className="mt-1 block w-full border border-gray-300 rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Capacidad Máxima (Autos)
          </label>
          <input
            type="number"
            value={formData.capacity || ""}
            onChange={(e) =>
              setFormData({ ...formData, capacity: e.target.value })
            }
            className="mt-1 block w-full border border-gray-300 rounded p-2"
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={() => navigate("/lots")}
            className="px-4 py-2 border rounded"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LotForm;
