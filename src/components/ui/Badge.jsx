import React from 'react';

export default function Badge({ children, variant = 'success', className = '' }) {
  const variants = {
    success: 'bg-green-100 text-green-700',
    neutral: 'bg-gray-100 text-gray-600',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    premium: 'bg-[#045023] text-white',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}