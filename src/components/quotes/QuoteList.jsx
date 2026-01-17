import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import quoteService from '../../services/quoteService';

const QuoteList = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    try {
      const data = await quoteService.getAll();
      setQuotes(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Cotizaciones</h1>
        <Link to="/quotes/new" className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">
          + Nueva Cotización
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehículo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="7" className="p-4 text-center">Cargando...</td></tr>
            ) : quotes.map((q) => (
              <tr key={q.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-bold text-gray-700">#{q.id}</td>
                <td className="px-6 py-4 text-gray-500">{q.date}</td>
                <td className="px-6 py-4 text-gray-900 font-medium">{q.client}</td>
                <td className="px-6 py-4 text-gray-500 text-sm">{q.vehicle}</td>
                <td className="px-6 py-4 text-green-600 font-bold">$ {Number(q.price).toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${q.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                    {q.status === 'pending' ? 'Pendiente' : q.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <Link to={`/quotes/view/${q.id}`} className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded">Ver PDF</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuoteList;