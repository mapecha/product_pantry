import React, { useState } from 'react';
import { Eye, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { SupplierEntry } from '../types/Supplier';

interface SupplierTableProps {
  suppliers: SupplierEntry[];
  onRowClick: (supplierId: string) => void;
  onView: (supplierId: string) => void;
  onApprove: (supplierId: string) => void;
  onReject: (supplierId: string) => void;
}

export const SupplierTable: React.FC<SupplierTableProps> = ({
  suppliers,
  onRowClick,
  onView,
  onApprove,
  onReject
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const totalPages = Math.ceil(suppliers.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentSuppliers = suppliers.slice(startIndex, endIndex);

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation(); // Prevent row click when clicking action buttons
    action();
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

  return (
    <div className="bg-white">
      {/* Table */}
      <div className="overflow-hidden border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Supplier
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                #SKU
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
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
              <tr
                key={supplier.id}
                onClick={() => onRowClick(supplier.id)}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {supplier.supplier}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {supplier.skuCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {supplier.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {renderHints(supplier.hasHints)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {renderActions(supplier)}
                </td>
              </tr>
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
            {startIndex + 1}-{Math.min(endIndex, suppliers.length)} of {suppliers.length}
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
  );
}; 