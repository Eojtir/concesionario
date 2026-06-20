/**
 * Formatea un número a moneda CLP (Chilena)
 * @param {number|string} value - Valor numérico a formatear
 * @param {boolean} showSymbol - Mostrar símbolo $ (por defecto true)
 * @returns {string} Valor formateado como CLP
 */
export const formatMoney = (value, showSymbol = true) => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Manejar valores inválidos
  if (!numValue && numValue !== 0) return showSymbol ? '$0' : '0';
  
  // Formatear con separadores de miles
  const formatted = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0, // CLP no usa decimales
    maximumFractionDigits: 0
  }).format(numValue);
  
  // Si no queremos el símbolo, removerlo
  if (!showSymbol) {
    return formatted.replace(/[CLP$\s]/g, '');
  }
  
  return formatted;
};

// Función extra: limpiar formato de dinero, dejando solo números
export const cleanMoney = (value) => {
  if (!value) return '0';
  return value.toString().replace(/[^\d]/g, '');
};


// Función extra: formatear porcentaje
export const formatPercentage = (value) => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (!numValue && numValue !== 0) return '0%';
  return `${numValue.toFixed(1)}%`;
};