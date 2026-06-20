import { Loading } from './Loading';

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