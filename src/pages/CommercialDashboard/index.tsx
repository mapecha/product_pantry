import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CommercialOverview } from './CommercialOverview';
import { ProductApproval } from './ProductApproval';
import { QueueManagement } from './QueueManagement';
import { CommercialReports } from './CommercialReports';

export const CommercialDashboard: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Routes>
        <Route path="/" element={<CommercialOverview />} />
        <Route path="/products" element={<ProductApproval />} />
        <Route path="/queue" element={<QueueManagement />} />
        <Route path="/reports" element={<CommercialReports />} />
        <Route path="*" element={<Navigate to="/commercial" replace />} />
      </Routes>
    </div>
  );
};