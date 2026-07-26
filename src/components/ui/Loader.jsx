import React from 'react';

export default function Loader({ text = 'Cargando...' }) {
  return (
    <div className="flex items-center gap-3 text-sm text-gray-600">
      <span className="w-5 h-5 rounded-full border-2 border-green-600 border-t-transparent animate-spin" />
      {text}
    </div>
  );
}