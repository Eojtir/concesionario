/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import quoteService from '../../services/quoteService';
import { useAuth } from '../../context/AuthProvider';
import { formatMoney } from '../../utils/formatters';

const QuoteDocument = React.lazy(() => import('./QuoteDocument'));
const PDFViewer = React.lazy(() => 
  import('@react-pdf/renderer').then(module => ({ default: module.PDFViewer }))
);
const PDFDownloadLink = React.lazy(() => 
  import('@react-pdf/renderer').then(module => ({ default: module.PDFDownloadLink }))
);

const QuoteView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { company, user } = useAuth();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const isValidId = /^\d+$/.test(id);

  useEffect(() => {
    if (!isValidId) {
      setError('ID de cotización inválido');
      setLoading(false);
      return;
    }
    
    fetchQuote();
  }, [id]);

  const fetchQuote = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await quoteService.getById(id);

      

      
      if (!response?.success || !response.data) {
        setError(response?.message || 'Cotización no encontrada');
      } else {
        const data = response.data;
        // Validar datos mínimos requeridos
        if (!data.client_id || !data.vehicle_id) {
          throw new Error('Datos incompletos en la cotización');
        }
        setQuote(data);
      }
    } catch (err) {
      console.error("Error cargando cotización", err);
      setError(err.message === 'Datos incompletos en la cotización' 
        ? err.message 
        : 'Error al cargar la cotización. Verifique el ID o intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleDownloadSuccess = () => {
    showNotification('PDF descargado exitosamente', 'success');
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Cargando documento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-lg">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => navigate('/quotes')}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Volver al listado
          </button>
        </div>
      </div>
    );
  }

  if (!quote) return null;

  const canGeneratePDF = quote.client && quote.vehicle && company;

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded shadow-lg ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white transition-all`}>
          {notification.message}
        </div>
      )}

      <div className="bg-white shadow p-4 flex flex-col md:flex-row justify-between items-center gap-4 z-10">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Visualizando Cotización #{id}</h1>
          <p className="text-sm text-gray-500">
            Cliente: {quote.client?.name || 'N/A'} | 
            Vehículo: {quote.vehicle?.make} {quote.vehicle?.model} | 
            Monto: {formatMoney(quote.price)}
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={fetchQuote}
            disabled={loading}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <svg className="inline w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refrescar
          </button>

          {canGeneratePDF && (
            <PDFDownloadLink
              document={<QuoteDocument quote={quote} company={company} />}
              fileName={`Cotizacion_${id}_${quote.client?.name || 'Cliente'}.pdf`}
              onClick={handleDownloadSuccess}
            >
              {({ blob, url, loading, error }) => (
                <button
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center"
                  disabled={loading}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {loading ? 'Preparando...' : 'Descargar PDF'}
                </button>
              )}
            </PDFDownloadLink>
          )}

          <Link 
            to="/quotes" 
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Volver al listado
          </Link>
        </div>
      </div>

      <div className="bg-blue-50 border-b p-2">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className='inline-flex gap-1'>
            <span className="text-gray-600">Creada por:</span>
            <p className="font-medium">{quote.created_by || user?.name || 'Sistema'}</p>
          </div>
          <div className='inline-flex gap-1'>
            <span className="text-gray-600">Fecha:</span>
            <p className="font-medium">{new Date(quote.date).toLocaleDateString('es-CL')}</p>
          </div>
          <div className='inline-flex gap-1'>
            <span className="text-gray-600">Válida hasta:</span>
            <p className="font-medium">{new Date(quote.valid_until).toLocaleDateString('es-CL')}</p>
          </div>
          <div className='inline-flex gap-1'>
            <span className="text-gray-600">Estado:</span>
            <p className={`font-medium ${new Date(quote.valid_until) >= new Date() ? 'text-green-600' : 'text-red-600'}`}>
              {new Date(quote.valid_until) >= new Date() ? 'Vigente' : 'Expirada'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1">
        {canGeneratePDF ? (
          <PDFViewer width="100%" height="100%" className="border-none">
            <QuoteDocument quote={quote} company={company} />
          </PDFViewer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-600">
              <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-semibold mb-2">Datos insuficientes</h3>
              <p>No se puede generar el PDF porque faltan datos requeridos.</p>
              <ul className="text-left mt-4 space-y-1">
                {!quote.client && <li className="text-red-600">• Faltan datos del cliente</li>}
                {!quote.vehicle && <li className="text-red-600">• Faltan datos del vehículo</li>}
                {!company && <li className="text-red-600">• Faltan datos de la empresa</li>}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuoteView;