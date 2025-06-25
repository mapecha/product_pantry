import React, { useState } from 'react';
import { Filter, X, Calendar, User, Users, ChevronDown } from 'lucide-react';
import { SupplierFilters } from '../types/Supplier';

interface SupplierFiltersProps {
  filters: SupplierFilters;
  onFiltersChange: (filters: SupplierFilters) => void;
  availableUsers: string[];
  currentUser?: string;
}

export const SupplierFiltersComponent: React.FC<SupplierFiltersProps> = ({
  filters,
  onFiltersChange,
  availableUsers,
  currentUser = 'Martin Pecha'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [taskView, setTaskView] = useState<'my' | 'all'>(
    filters.odpovědnyUzivatel === currentUser ? 'my' : 'all'
  );
  const handleFilterChange = (key: keyof SupplierFilters, value: string | boolean) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleTaskViewChange = (view: 'my' | 'all') => {
    setTaskView(view);
    if (view === 'my') {
      handleFilterChange('odpovědnyUzivatel', currentUser);
    } else {
      handleFilterChange('odpovědnyUzivatel', '');
    }
  };

  const clearFilters = () => {
    setTaskView('all');
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
      {/* Primary Filter Bar */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Task Toggle Buttons */}
            <div className="inline-flex rounded-lg bg-gray-100 p-1">
              <button
                onClick={() => handleTaskViewChange('my')}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all
                  ${taskView === 'my' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                <User className="w-4 h-4" />
                <span>Moje úkoly</span>
                {taskView === 'my' && (
                  <span className="ml-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                    {filters.odpovědnyUzivatel === currentUser ? 'Aktivní' : '0'}
                  </span>
                )}
              </button>
              <button
                onClick={() => handleTaskViewChange('all')}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all
                  ${taskView === 'all' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                <Users className="w-4 h-4" />
                <span>Všechny úkoly</span>
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative">
              <input
                type="text"
                value={filters.supplierName}
                onChange={(e) => handleFilterChange('supplierName', e.target.value)}
                placeholder="Hledat dodavatele..."
                className="pl-10 pr-4 py-2 w-64 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Filter className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Active Filters Badge */}
            {hasActiveFilters && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Aktivní filtry:</span>
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                  {Object.values(filters).filter(v => v).length}
                </span>
              </div>
            )}

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <span>Pokročilé filtry</span>
              <ChevronDown className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>

            {/* Clear All Button */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Vymazat vše</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {isExpanded && (
        <div className="p-6 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Responsible User Filter - Only show when "All Tasks" is selected */}
            {taskView === 'all' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Odpovědný uživatel
                </label>
                <select
                  value={filters.odpovědnyUzivatel}
                  onChange={(e) => handleFilterChange('odpovědnyUzivatel', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Všichni uživatelé</option>
                  {availableUsers.map((user) => (
                    <option key={user} value={user}>
                      {user}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Date From Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Datum od
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Date To Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Datum do
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Hide Processed Checkbox */}
            <div className="md:col-span-2 lg:col-span-3">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.hideProcessed}
                  onChange={(e) => handleFilterChange('hideProcessed', e.target.checked)}
                  className="sr-only"
                />
                <div className="relative">
                  <div className={`block w-10 h-6 rounded-full transition-colors ${
                    filters.hideProcessed ? 'bg-blue-600' : 'bg-gray-200'
                  }`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                    filters.hideProcessed ? 'transform translate-x-4' : ''
                  }`}></div>
                </div>
                <span className="ml-3 text-sm text-gray-700">Skrýt zpracované položky</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Pills */}
      {hasActiveFilters && (
        <div className="px-4 pb-4">
          <div className="flex flex-wrap gap-2">
            {filters.supplierName && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                <Filter className="w-3 h-3 mr-1" />
                {filters.supplierName}
                <button
                  onClick={() => handleFilterChange('supplierName', '')}
                  className="ml-1 hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.odpovědnyUzivatel && taskView === 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                <User className="w-3 h-3 mr-1" />
                {filters.odpovědnyUzivatel}
                <button
                  onClick={() => handleFilterChange('odpovědnyUzivatel', '')}
                  className="ml-1 hover:text-green-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.dateFrom && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                <Calendar className="w-3 h-3 mr-1" />
                Od: {new Date(filters.dateFrom).toLocaleDateString('cs-CZ')}
                <button
                  onClick={() => handleFilterChange('dateFrom', '')}
                  className="ml-1 hover:text-purple-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.dateTo && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                <Calendar className="w-3 h-3 mr-1" />
                Do: {new Date(filters.dateTo).toLocaleDateString('cs-CZ')}
                <button
                  onClick={() => handleFilterChange('dateTo', '')}
                  className="ml-1 hover:text-purple-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.hideProcessed && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300">
                Bez zpracovaných
                <button
                  onClick={() => handleFilterChange('hideProcessed', false)}
                  className="ml-1 hover:text-gray-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};