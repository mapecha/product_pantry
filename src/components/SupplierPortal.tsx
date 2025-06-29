import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Navigation } from './Navigation';
import { SupplierTable } from './SupplierTable';
import { SKUManagement } from './SKUManagement';
import { suppliers } from '../data/suppliers';
import { SupplierFilters } from '../types/Supplier';

export const SupplierPortal: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    // Set initial tab based on current path
    if (location.pathname === '/sku-management') {
      return 'sku-management';
    }
    return 'pantry-signoff';
  });
  const [filters, setFilters] = useState<SupplierFilters>({
    supplierName: '',
    hideProcessed: true,
    odpovědnyUzivatel: '',
    dateFrom: '',
    dateTo: ''
  });

  // Filter suppliers based on search criteria - this filtering is now handled inside SupplierTable
  const filteredSuppliers = suppliers;

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Update URL for SKU Management tab
    if (tab === 'sku-management') {
      navigate('/sku-management');
    } else {
      navigate('/');
    }
  };

  const handleRowClick = (supplierId: string) => {
    // Navigate to product detail view when clicking a row
    navigate(`/product-pantry/${supplierId}`);
  };

  const handleView = (supplierId: string) => {
    console.log('View supplier:', supplierId);
    navigate(`/product-pantry/${supplierId}`);
  };

  const handleApprove = (supplierId: string) => {
    console.log('Approve supplier:', supplierId);
    // In a real app, this would make an API call
    alert(`Supplier ${supplierId} approved successfully!`);
  };

  const handleReject = (supplierId: string) => {
    console.log('Reject supplier:', supplierId);
    // In a real app, this would make an API call
    alert(`Supplier ${supplierId} rejected.`);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'pantry-signoff':
        return (
          <div className="max-w-7xl mx-auto">
            <div className="px-6 py-6">
              <SupplierTable
                suppliers={filteredSuppliers}
                onRowClick={handleRowClick}
                onView={handleView}
                onApprove={handleApprove}
                onReject={handleReject}
                filters={filters}
                onFiltersChange={setFilters}
              />
            </div>
          </div>
        );
      
      case 'reservation':
        return (
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Reservation</h2>
              <p className="text-gray-600">This section is under development.</p>
            </div>
          </div>
        );
      
      case 'performance':
        return (
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Performance Overview</h2>
              <p className="text-gray-600">This section is under development.</p>
            </div>
          </div>
        );
      
      case 'administration':
        return (
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Administration</h2>
              <p className="text-gray-600">This section is under development.</p>
            </div>
          </div>
        );
      
      case 'product-pantry':
        return (
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Product Pantry</h2>
              <p className="text-gray-600">This section is under development.</p>
            </div>
          </div>
        );
      
      case 'sku-management':
        return <SKUManagement />;
      
      default:
        return (
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Coming Soon</h2>
              <p className="text-gray-600">This section is under development.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeTab={activeTab} onTabChange={handleTabChange} />
      {renderTabContent()}
    </div>
  );
}; 