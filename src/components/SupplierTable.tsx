import React, { useState } from 'react';
import { Eye, Check, X, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, User, Calendar, Package } from 'lucide-react';
import { SupplierEntry, SupplierFilters, SKUEntry } from '../types/Supplier';
import { SupplierFiltersComponent } from './SupplierFilters';

interface SupplierTableProps {
  suppliers: SupplierEntry[];
  onRowClick: (supplierId: string) => void;
  onView: (supplierId: string) => void;
  onApprove: (supplierId: string) => void;
  onReject: (supplierId: string) => void;
  filters: SupplierFilters;
  onFiltersChange: (filters: SupplierFilters) => void;
}

export const SupplierTable: React.FC<SupplierTableProps> = ({
  suppliers,
  onRowClick,
  onView,
  onApprove,
  onReject,
  filters,
  onFiltersChange
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [expandedSuppliers, setExpandedSuppliers] = useState<Set<string>>(new Set());

  // Get unique users for filter dropdown
  const availableUsers = Array.from(new Set(suppliers.map(s => s.odpovědnyUzivatel).filter(Boolean))).sort();

  // Apply filters
  const filteredSuppliers = suppliers.filter(supplier => {
    // Supplier name filter
    if (filters.supplierName && !supplier.supplier.toLowerCase().includes(filters.supplierName.toLowerCase())) {
      return false;
    }

    // Responsible user filter
    if (filters.odpovědnyUzivatel && supplier.odpovědnyUzivatel !== filters.odpovědnyUzivatel) {
      return false;
    }

    // Date range filter (using changeDate)
    if (filters.dateFrom && supplier.changeDate < filters.dateFrom) {
      return false;
    }
    if (filters.dateTo && supplier.changeDate > filters.dateTo) {
      return false;
    }

    // Hide processed filter
    if (filters.hideProcessed && supplier.status === 'processed') {
      return false;
    }

    return true;
  });

  const totalPages = Math.ceil(filteredSuppliers.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentSuppliers = filteredSuppliers.slice(startIndex, endIndex);

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation(); // Prevent row click when clicking action buttons
    action();
  };

  const toggleSupplierExpansion = (e: React.MouseEvent, supplierId: string) => {
    e.stopPropagation(); // Prevent row click
    setExpandedSuppliers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(supplierId)) {
        newSet.delete(supplierId);
      } else {
        newSet.add(supplierId);
      }
      return newSet;
    });
  };

  const handleSKUApprove = (supplierId: string, sku: SKUEntry) => {
    console.log(`Approving SKU: ${sku.name} for supplier: ${supplierId}`);
    alert(`✅ SKU "${sku.name}" approved successfully!`);
    // Here you would update the SKU status or make an API call
  };

  const handleSKUReject = (supplierId: string, sku: SKUEntry) => {
    console.log(`Rejecting SKU: ${sku.name} for supplier: ${supplierId}`);
    alert(`❌ SKU "${sku.name}" rejected.`);
    // Here you would update the SKU status or make an API call
  };

  const renderHints = (hasHints: boolean) => {
    if (!hasHints) return null;
    return (
      <div className="flex items-center justify-center">
        <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center">
          <X className="w-3 h-3 text-white" />
        </div>
      </div>
    );
  };

  const renderActions = (supplier: SupplierEntry) => (
    <div className="flex items-center space-x-1">
      <button
        onClick={(e) => handleActionClick(e, () => onView(supplier.id))}
        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
        title="View details"
      >
        <Eye className="w-4 h-4" />
      </button>
      <button
        onClick={(e) => handleActionClick(e, () => onApprove(supplier.id))}
        className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
        title="Approve"
      >
        <Check className="w-4 h-4" />
      </button>
      <button
        onClick={(e) => handleActionClick(e, () => onReject(supplier.id))}
        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
        title="Reject"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );

  const renderSKURows = (supplier: SupplierEntry) => {
    if (!expandedSuppliers.has(supplier.id) || !supplier.skus || supplier.skus.length === 0) {
      return null;
    }

    // Group SKUs by responsible user
    const skusByUser = supplier.skus.reduce((acc, sku) => {
      if (!acc[sku.responsibleUser]) {
        acc[sku.responsibleUser] = [];
      }
      acc[sku.responsibleUser].push(sku);
      return acc;
    }, {} as Record<string, SKUEntry[]>);

    const rows: JSX.Element[] = [];

    Object.entries(skusByUser).forEach(([responsibleUser, skus]) => {
      // Responsible user header row
      rows.push(
        <tr key={`${supplier.id}-user-${responsibleUser}`} className="bg-blue-50">
          <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900" colSpan={4}>
            <div className="pl-4 flex items-center space-x-2">
              <User className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-900">{responsibleUser}</span>
              <span className="text-xs text-blue-700">({skus.length} SKU{skus.length > 1 ? 's' : ''})</span>
            </div>
          </td>
        </tr>
      );

      // SKU rows under this user
      skus.forEach((sku) => {
        rows.push(
          <tr key={`${supplier.id}-${sku.id}`} className="bg-gray-50">
            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900" colSpan={4}>
              <div className="pl-12 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Package className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">{sku.name}</div>
                    <div className="text-xs text-gray-500 flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{supplier.changeDate}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSKUApprove(supplier.id, sku);
                    }}
                    className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    title="Approve SKU"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSKUReject(supplier.id, sku);
                    }}
                    className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    title="Reject SKU"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </td>
          </tr>
        );
      });
    });

    return rows;
  };

  return (
    <div>
      {/* Filters */}
      <SupplierFiltersComponent
        filters={filters}
        onFiltersChange={onFiltersChange}
        availableUsers={availableUsers}
      />

      {/* Results Summary */}
      <div className="mb-4 text-sm text-gray-600">
        Zobrazeno {currentSuppliers.length} z {filteredSuppliers.length} dodavatelů
        {filteredSuppliers.length !== suppliers.length && ` (celkem ${suppliers.length})`}
      </div>

      <div className="bg-white">
        {/* Table */}
        <div className="overflow-hidden border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <span>Název dodavatele</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <span>#SKU</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hints
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentSuppliers.map((supplier) => (
                <React.Fragment key={supplier.id}>
                  <tr
                    onClick={() => onRowClick(supplier.id)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center space-x-2">
                        {supplier.skus && supplier.skus.length > 0 && (
                          <button
                            onClick={(e) => toggleSupplierExpansion(e, supplier.id)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            title={expandedSuppliers.has(supplier.id) ? "Collapse SKUs" : "Expand SKUs"}
                          >
                            {expandedSuppliers.has(supplier.id) ? (
                              <ChevronDown className="w-4 h-4 text-gray-600" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                        )}
                        <div>
                          <div className="font-medium">{supplier.supplier}</div>
                          <div className="text-xs text-gray-500">ID: {supplier.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {supplier.skuCount} SKU
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {renderHints(supplier.hasHints)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {renderActions(supplier)}
                    </td>
                  </tr>
                  {renderSKURows(supplier)}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              {startIndex + 1}-{Math.min(endIndex, filteredSuppliers.length)} of {filteredSuppliers.length}
              {filteredSuppliers.length !== suppliers.length && ` (${suppliers.length} celkem)`}
            </span>
            
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};