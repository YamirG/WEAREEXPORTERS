import React from 'react';
import Card from './Card';

export default function StatCard({ title, value, subtitle, icon, className = '' }) {
  return (
    <Card className={`p-4 md:p-5 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-2">{value}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>

        {icon && (
          <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}