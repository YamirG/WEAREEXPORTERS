// Función para formatear valores monetarios
export const formatCurrency = (value, currency = 'USD', locale = 'en-US') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

// Función para formatear fechas
export const formatDate = (date, locale = 'es-MX') => {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Función para truncar texto
export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// Función para generar un ID único
export const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Función para filtrar un array por término de búsqueda
export const filterBySearchTerm = (array, searchTerm, fields) => {
  if (!searchTerm) return array;
  
  const lowerCaseSearchTerm = searchTerm.toLowerCase();
  
  return array.filter(item => {
    return fields.some(field => {
      const fieldValue = item[field];
      if (typeof fieldValue === 'string') {
        return fieldValue.toLowerCase().includes(lowerCaseSearchTerm);
      }
      return false;
    });
  });
};

// Función para ordenar un array por un campo específico
export const sortArrayByField = (array, field, direction = 'asc') => {
  return [...array].sort((a, b) => {
    if (a[field] < b[field]) return direction === 'asc' ? -1 : 1;
    if (a[field] > b[field]) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

// Función para agrupar un array por un campo específico
export const groupArrayByField = (array, field) => {
  return array.reduce((groups, item) => {
    const value = item[field];
    groups[value] = groups[value] || [];
    groups[value].push(item);
    return groups;
  }, {});
};

// Función para debounce (retrasar la ejecución de una función)
export const debounce = (func, delay) => {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

// Función para throttle (limitar la frecuencia de ejecución de una función)
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};