import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from './Navigation';
import { SearchFilters } from './SearchFilters';
import { SupplierTable } from './SupplierTable';
import { suppliers } from '../data/suppliers';
import { SupplierFilters } from '../types/Supplier';

export const SupplierPortal: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('product-pantry');
  const [filters, setFilters] = useState<SupplierFilters>({
    supplierName: '',
    hideProcessed: true
  });

  // Filter suppliers based on search criteria
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((supplier) => {
      const matchesName = supplier.supplier
        .toLowerCase()
        .includes(filters.supplierName.toLowerCase());
      
      const matchesProcessed = filters.hideProcessed 
        ? supplier.status !== 'processed'
        : true;

      return matchesName && matchesProcessed;
    });
  }, [filters]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // In a real app, you might navigate to different routes based on tab
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeTab={activeTab} onTabChange={handleTabChange} />
      
      <div className="max-w-7xl mx-auto">
        <SearchFilters filters={filters} onFiltersChange={setFilters} />
        
        <div className="px-6 py-6">
          <SupplierTable
            suppliers={filteredSuppliers}
            onRowClick={handleRowClick}
            onView={handleView}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </div>
      </div>
    </div>
  );
}; 