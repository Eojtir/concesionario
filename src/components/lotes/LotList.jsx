import React, { useEffect, useState } from "react";
import lotService from "../../services/lotService";
import { Link } from "react-router-dom";

const LotList = () => {
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLots();
  }, []);

  const loadLots = async () => {
    try {
      const data = await lotService.getAll();
      setLots(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "¿Eliminar este lote? Los autos asociados quedarán históricos."
      )
    ) {
      try {
        await lotService.delete(id);
        setLots(lots.filter((l) => l.id !== id));
      } catch (error) {
        alert("Error al eliminar");
      }
    }
  };

  if (loading) return <div className="p-10 text-center">Cargando lotes...</div>;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h3 className="text-lg font-bold text-gray-800">
          Mis Lotes / Sucursales
        </h3>
        <Link
          to="/lots/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
        >
          + Nuevo Lote
        </Link>
      </div>

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Nombre
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Dirección
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Capacidad
            </th>
            <th className="px-6 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {lots.map((lot) => (
            <tr key={lot.id}>
              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                {lot.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                {lot.address || "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                {lot.capacity} autos
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Link
                  to={`/lots/edit/${lot.id}`}
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                >
                  Editar
                </Link>
                <button
                  onClick={() => handleDelete(lot.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
          {lots.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center p-4 text-gray-500">
                No tienes lotes registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LotList;
