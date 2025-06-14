import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SupplyChainOverview } from './SupplyChainOverview';
import { TaskManagement } from './TaskManagement';
import { EDIConnections } from './EDIConnections';
import { OrderManagement } from './OrderManagement';
import { SupplyChainHistory } from './SupplyChainHistory';

export const SupplyChainDashboard: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Routes>
        <Route index element={<SupplyChainOverview />} />
        <Route path="tasks" element={<TaskManagement />} />
        <Route path="edi" element={<EDIConnections />} />
        <Route path="orders" element={<OrderManagement />} />
        <Route path="history" element={<SupplyChainHistory />} />
      </Routes>
    </div>
  );
};