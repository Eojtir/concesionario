import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PDFViewer } from '@react-pdf/renderer';
import quoteService from '../../services/quoteService';
import { AuthContext } from '../../context/AuthProvider';
import QuoteDocument from './QuoteDocument';

const QuoteView = () => {
  const { id } = useParams();
  const { company } = useContext(AuthContext); // Traemos los datos de la empresa del contexto
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const data = await quoteService.getById(id);
        setQuote(data);
      } catch (error) {
        console.error("Error cargando cotización", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuote();
  }, [id]);

  if (loading) return <div className="p-10 text-center">Cargando documento...</div>;
  if (!quote) return <div className="p-10 text-center text-red-500">Cotización no encontrada</div>;

  return (
    <div className="h-screen flex flex-col">
      {/* Barra superior de navegación */}
      <div className="bg-white shadow p-4 flex justify-between items-center z-10">
        <h1 className="text-xl font-bold text-gray-800">Visualizando Cotización #{id}</h1>
        <Link to="/quotes" className="text-blue-600 hover:underline">Volver al listado</Link>
      </div>

      {/* El visor de PDF ocupa todo el resto de la pantalla */}
      <div className="flex-1 bg-gray-500">
        <PDFViewer width="100%" height="100%" className="border-none">
          <QuoteDocument quote={quote} company={company} />
        </PDFViewer>
      </div>
    </div>
  );
};

export default QuoteView;