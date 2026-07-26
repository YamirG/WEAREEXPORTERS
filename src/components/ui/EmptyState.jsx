import React from 'react';
import Button from './Button';

export default function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-8 text-center">
      <div className="mx-auto w-14 h-14 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center text-2xl mb-4">
        ✦
      </div>

      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">{description}</p>

      {actionLabel && (
        <Button variant="secondary" className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}