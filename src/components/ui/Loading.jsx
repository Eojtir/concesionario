// src/components/ui/Loading.jsx
export const Loading = ({ fullScreen = true }) => {
  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-cyan-500"></div>
      </div>
    );
  }
  return <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500"></div>;
};

// src/components/ui/DataTable.jsx
export const DataTable = ({ columns, data, onRowClick, loading }) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-cyan-500/20">
      <table className="w-full text-sm text-left text-gray-300">
        <thead className="text-xs uppercase bg-slate-800 text-cyan-400">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-6 py-3">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-8">
                <Loading fullScreen={false} />
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-8 text-gray-400">
                No hay datos para mostrar
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={row.id || idx}
                className="bg-slate-900 border-b border-cyan-500/10 hover:bg-slate-800 cursor-pointer"
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

// src/components/ui/Modal.jsx
import { useEffect } from 'react';

export const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl shadow-2xl border border-cyan-500/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-cyan-500/20">
          <h2 className="text-xl font-bold text-cyan-400">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};