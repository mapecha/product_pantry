import React from 'react';
import { Eye } from 'lucide-react';

export const SupplierReadOnlyPortal: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Supplier Portal</h1>
      
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <Eye className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Supplier Read-Only View</h3>
        <p className="mt-1 text-sm text-gray-500">
          Product status tracking will be implemented in Phase 5.
        </p>
      </div>
    </div>
  );
};