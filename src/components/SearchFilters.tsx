import React from 'react';
import { SupplierFilters } from '../types/Supplier';

interface SearchFiltersProps {
  filters: SupplierFilters;
  onFiltersChange: (filters: SupplierFilters) => void;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({ filters, onFiltersChange }) => {
  const handleSupplierNameChange = (value: string) => {
    onFiltersChange({
      ...filters,
      supplierName: value
    });
  };

  const handleHideProcessedChange = (checked: boolean) => {
    onFiltersChange({
      ...filters,
      hideProcessed: checked
    });
  };

  return (
    <div className="bg-white px-6 py-4 border-b border-gray-200">
      <div className="flex items-center space-x-6">
        {/* Supplier name search */}
        <div className="flex-1 max-w-xs">
          <input
            type="text"
            placeholder="Supplier name"
            value={filters.supplierName}
            onChange={(e) => handleSupplierNameChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Hide processed entries checkbox */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <input
              type="checkbox"
              id="hideProcessed"
              checked={filters.hideProcessed}
              onChange={(e) => handleHideProcessedChange(e.target.checked)}
              className="w-4 h-4 text-green-600 bg-white border-gray-300 rounded focus:ring-green-500 focus:ring-2"
            />
            {filters.hideProcessed && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          <label htmlFor="hideProcessed" className="text-sm text-gray-700 cursor-pointer">
            Hide processed entries
          </label>
        </div>
      </div>
    </div>
  );
}; 