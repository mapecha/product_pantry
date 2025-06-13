import React from 'react';
import { Filter, X, Calendar } from 'lucide-react';
import { SupplierFilters } from '../types/Supplier';

interface SupplierFiltersProps {
  filters: SupplierFilters;
  onFiltersChange: (filters: SupplierFilters) => void;
  availableUsers: string[];
}

export const SupplierFiltersComponent: React.FC<SupplierFiltersProps> = ({
  filters,
  onFiltersChange,
  availableUsers
}) => {
  const handleFilterChange = (key: keyof SupplierFilters, value: string | boolean) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      supplierName: '',
      hideProcessed: false,
      odpovědnyUzivatel: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  const hasActiveFilters = filters.supplierName || filters.odpovědnyUzivatel || filters.dateFrom || filters.dateTo || filters.hideProcessed;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Filtry</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Vymazat filtry</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Supplier Name Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Název dodavatele
          </label>
          <input
            type="text"
            value={filters.supplierName}
            onChange={(e) => handleFilterChange('supplierName', e.target.value)}
            placeholder="Hledat dodavatele..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Responsible User Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Odpovědný uživatel
          </label>
          <select
            value={filters.odpovědnyUzivatel}
            onChange={(e) => handleFilterChange('odpovědnyUzivatel', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Všichni uživatelé</option>
            {availableUsers.map((user) => (
              <option key={user} value={user}>
                {user}
              </option>
            ))}
          </select>
        </div>

        {/* Date From Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Datum od
          </label>
          <div className="relative">
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Date To Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Datum do
          </label>
          <div className="relative">
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Hide Processed Checkbox */}
      <div className="mt-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={filters.hideProcessed}
            onChange={(e) => handleFilterChange('hideProcessed', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Skrýt zpracované položky</span>
        </label>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="font-medium">Aktivní filtry:</span>
            <div className="flex flex-wrap gap-2">
              {filters.supplierName && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Dodavatel: {filters.supplierName}
                </span>
              )}
              {filters.odpovědnyUzivatel && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Uživatel: {filters.odpovědnyUzivatel}
                </span>
              )}
              {filters.dateFrom && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Od: {filters.dateFrom}
                </span>
              )}
              {filters.dateTo && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Do: {filters.dateTo}
                </span>
              )}
              {filters.hideProcessed && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Bez zpracovaných
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};