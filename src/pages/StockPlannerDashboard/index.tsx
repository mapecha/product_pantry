import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { StockPlannerOverview } from './StockPlannerOverview';
import { WarehouseAssignments } from './WarehouseAssignments';
import { CapacityManagement } from './CapacityManagement';
import { AssignmentHistory } from './AssignmentHistory';

export const StockPlannerDashboard: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Routes>
        <Route path="/" element={<StockPlannerOverview />} />
        <Route path="/assignments" element={<WarehouseAssignments />} />
        <Route path="/capacity" element={<CapacityManagement />} />
        <Route path="/history" element={<AssignmentHistory />} />
        <Route path="*" element={<Navigate to="/stock-planner" replace />} />
      </Routes>
    </div>
  );
};