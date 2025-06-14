import React from 'react';
import { FileText } from 'lucide-react';

export const CommercialReports: React.FC = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="mt-1 text-sm text-gray-600">
          View approval metrics and queue performance reports.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-8 text-center">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Reports coming soon</h3>
        <p className="mt-1 text-sm text-gray-500">
          This section will contain detailed analytics and reports.
        </p>
      </div>
    </div>
  );
};