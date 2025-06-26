import React, { useState } from 'react';
import { X, Warehouse } from 'lucide-react';

interface WarehouseSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedWarehouses: string[]) => void;
  productName: string;
}

const WAREHOUSES = ['Prague', 'Brno', 'Ostrava'];

export const WarehouseSelectionModal: React.FC<WarehouseSelectionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  productName
}) => {
  const [selectedWarehouses, setSelectedWarehouses] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleWarehouseToggle = (warehouse: string) => {
    setSelectedWarehouses(prev => {
      if (prev.includes(warehouse)) {
        return prev.filter(w => w !== warehouse);
      }
      return [...prev, warehouse];
    });
  };

  const handleConfirm = () => {
    if (selectedWarehouses.length > 0) {
      onConfirm(selectedWarehouses);
      setSelectedWarehouses([]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                <Warehouse className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Select Warehouses to List
                </h3>
                <p className="text-sm text-gray-500">
                  Choose where to list: {productName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3 mb-6">
            {WAREHOUSES.map(warehouse => (
              <label
                key={warehouse}
                className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedWarehouses.includes(warehouse)}
                  onChange={() => handleWarehouseToggle(warehouse)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">{warehouse}</p>
                  <p className="text-xs text-gray-500">Available for listing</p>
                </div>
              </label>
            ))}
          </div>

          {selectedWarehouses.length === 0 && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                Please select at least one warehouse to continue with approval.
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedWarehouses.length === 0}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                selectedWarehouses.length > 0
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Approve & List ({selectedWarehouses.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};