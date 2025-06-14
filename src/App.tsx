import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SupplierPortal } from './components/SupplierPortal';
import { ProductDetailPage } from './components/ProductDetailPage';
import { CommercialDashboard } from './pages/CommercialDashboard';
import { StockPlannerDashboard } from './pages/StockPlannerDashboard';
import { SupplyChainDashboard } from './pages/SupplyChainDashboard';
import { SupplierReadOnlyPortal } from './pages/SupplierPortal';
import { RoleNavigation } from './components/shared/RoleNavigation';

function App() {
  // In a real app, this would come from authentication context
  const [currentUserRole, setCurrentUserRole] = React.useState('stock_planner'); // For demo purposes

  return (
    <Router>
      <div className="App">
        <RoleNavigation userRole={currentUserRole} />
        
        {/* Role Switcher for Demo */}
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <span className="text-sm text-yellow-800">
              🧪 Demo Mode - Switch Roles:
            </span>
            <div className="flex space-x-2">
              {['commercial', 'stock_planner', 'supply_chain', 'supplier'].map(role => (
                <button
                  key={role}
                  onClick={() => setCurrentUserRole(role)}
                  className={`px-3 py-1 text-xs rounded ${
                    currentUserRole === role 
                      ? 'bg-yellow-200 text-yellow-900' 
                      : 'bg-white text-yellow-700 hover:bg-yellow-100'
                  }`}
                >
                  {role.replace('_', ' ').toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Original routes */}
            <Route path="/" element={<Navigate to={`/${currentUserRole}`} replace />} />
            <Route path="/supplier-entry" element={<SupplierPortal />} />
            <Route path="/product-pantry/:supplierId" element={<ProductDetailPage />} />
            
            {/* Role-based dashboards */}
            <Route path="/commercial/*" element={<CommercialDashboard />} />
            <Route path="/stock-planner/*" element={<StockPlannerDashboard />} />
            <Route path="/supply-chain/*" element={<SupplyChainDashboard />} />
            <Route path="/supplier/*" element={<SupplierReadOnlyPortal />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;