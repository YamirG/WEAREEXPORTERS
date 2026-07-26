import React from 'react';

export default function Alert({ children, variant = 'success', className = '' }) {
  const variants = {
    success: 'bg-green-50 text-green-800 border-green-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    danger: 'bg-red-50 text-red-800 border-red-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
  };

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
}