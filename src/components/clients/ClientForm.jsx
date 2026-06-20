/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import clientService from "../../services/clientService";
import toast from "react-hot-toast";

const ClientForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: "",
    rut: "",
    phone: "",
    email: "",
    address: "",
    city: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit) {
      loadClient();
    }
  }, [id]);

  const loadClient = async () => {
    try {
      const data = await clientService.getById(id);
      if (data) {
        setFormData({
          name: data.name,
          rut: data.rut,
          phone: data.phone,
          email: data.email,
          address: data.address,
          city: data.city,
        });
      }
    } catch (err) {
      setError("Error cargando cliente");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (isEdit) {
        const resp = await clientService.update(id, formData);
        toast.success(resp);
      } else {
        const resp = await clientService.create(formData);
        toast.success(resp);
      }

      navigate("/clients");
    } catch (err) {
      setError(err.response?.data?.error || "Error guardando cliente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow rounded-lg">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-6">
          {isEdit ? "Editar Cliente" : "Nuevo Cliente"}
        </h2>
        <p className="text-blue-100 mt-1">
          {isEdit
            ? `Actualizando información de ${formData.name || ""} `
            : "Añade un nuevo vehículo a tu inventario"}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 mt-5">
        {/* Nombre y RUT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre Completo
            </label>
            <input
              required
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              RUT / DNI
            </label>
            <input
              required
              name="rut"
              value={formData.rut}
              onChange={handleChange}
              disabled={isEdit}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 disabled:bg-gray-100"
            />
          </div>
        </div>

        {/* Contacto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Teléfono
            </label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
        </div>

        {/* Dirección */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Dirección
            </label>
            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Ciudad
            </label>
            <input
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/clients")}
            className="bg-gray-200 px-4 py-2 rounded text-gray-800 hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-700"
          >
            {loading ? "Guardando..." : "Guardar Cliente"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClientForm;
