import React, { useState, useEffect } from 'react';
import { Package, MapPin, ArrowLeft, CheckCircle, Warehouse, Building2 } from 'lucide-react';
import { skuService } from '../../services/skuService';
import { SKU, SKUState } from '../../types/SKUManagement';

export const WarehouseAssignment: React.FC = () => {
  const [assignmentSKUs, setAssignmentSKUs] = useState<SKU[]>([]);
  const [selectedSKU, setSelectedSKU] = useState<SKU | null>(null);
  const [warehousePosition, setWarehousePosition] = useState('');
  const [moveBackwardModal, setMoveBackwardModal] = useState<{
    isOpen: boolean;
    sku: SKU | null;
    reason: string;
  }>({ isOpen: false, sku: null, reason: '' });

  useEffect(() => {
    loadSKUs();
    const unsubscribe = skuService.subscribe(loadSKUs);
    return unsubscribe;
  }, []);

  const loadSKUs = () => {
    setAssignmentSKUs(skuService.getSKUs(SKUState.ASSIGN_WAREHOUSE_POSITION));
  };

  const handleAssignPosition = () => {
    if (selectedSKU && warehousePosition) {
      skuService.assignWarehousePosition(selectedSKU.id, warehousePosition, 'current-user');
      setSelectedSKU(null);
      setWarehousePosition('');
    }
  };

  const handleMoveBackward = () => {
    if (moveBackwardModal.sku && moveBackwardModal.reason) {
      skuService.moveBackward(moveBackwardModal.sku.id, 'current-user', moveBackwardModal.reason);
      setMoveBackwardModal({ isOpen: false, sku: null, reason: '' });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Group SKUs by warehouse
  const skusByWarehouse = assignmentSKUs.reduce((acc, sku) => {
    const warehouseName = sku.warehouse?.name || 'Unassigned';
    if (!acc[warehouseName]) {
      acc[warehouseName] = [];
    }
    acc[warehouseName].push(sku);
    return acc;
  }, {} as Record<string, SKU[]>);

  // Define warehouse order and icons
  const warehouseConfig: Record<string, { order: number; color: string; icon: string }> = {
    'Prague Central': { order: 1, color: 'blue', icon: '🏢' },
    'Brno Distribution': { order: 2, color: 'green', icon: '🏭' },
    'Ostrava Hub': { order: 3, color: 'purple', icon: '🏗️' }
  };

  const sortedWarehouses = Object.keys(skusByWarehouse).sort((a, b) => {
    const orderA = warehouseConfig[a]?.order || 999;
    const orderB = warehouseConfig[b]?.order || 999;
    return orderA - orderB;
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Warehouse Assignment</h2>
        <p className="mt-1 text-sm text-gray-600">
          Assign warehouse positions to SKUs by location.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <MapPin className="h-10 w-10 text-orange-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Awaiting Position</p>
              <p className="text-2xl font-bold text-gray-900">{assignmentSKUs.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Warehouse className="h-10 w-10 text-blue-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Active Warehouses</p>
              <p className="text-2xl font-bold text-gray-900">{Object.keys(skusByWarehouse).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <CheckCircle className="h-10 w-10 text-green-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">94%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Warehouse Sections */}
      <div className="space-y-6">
        {sortedWarehouses.map((warehouseName) => {
          const skus = skusByWarehouse[warehouseName];
          const config = warehouseConfig[warehouseName];
          const colorClass = config?.color || 'gray';
          
          return (
            <div key={warehouseName} className="bg-white rounded-lg shadow">
              <div className={`px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-${colorClass}-50 to-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{config?.icon || '📦'}</span>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{warehouseName}</h3>
                      <p className="text-sm text-gray-600">{skus.length} SKUs awaiting position</p>
                    </div>
                  </div>
                  <Building2 className={`h-6 w-6 text-${colorClass}-600`} />
                </div>
              </div>
              
              {skus.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p>No SKUs awaiting position assignment</p>
                </div>
              ) : (
                <div className="p-4 space-y-2">
                  {skus.map((sku) => (
                    <div
                      key={sku.id}
                      onClick={() => setSelectedSKU(sku)}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedSKU?.id === sku.id
                          ? `border-${colorClass}-500 bg-${colorClass}-50 shadow-md`
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {sku.productName}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {sku.supplier} • SKU: {sku.id}
                          </p>
                          {sku.warehousesToList && sku.warehousesToList.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {sku.warehousesToList.map((warehouse) => (
                                <span
                                  key={warehouse}
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                    warehouse === 'Prague' ? 'bg-blue-100 text-blue-800' :
                                    warehouse === 'Brno' ? 'bg-green-100 text-green-800' :
                                    warehouse === 'Ostrava' ? 'bg-purple-100 text-purple-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {warehouse}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${colorClass}-100 text-${colorClass}-800`}>
                            Assign Position
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMoveBackwardModal({ isOpen: true, sku, reason: '' });
                            }}
                            className="text-xs text-gray-500 hover:text-red-600"
                          >
                            <ArrowLeft className="w-3 h-3 inline mr-1" />
                            Move Back
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
        
      {/* Position Assignment Form */}
      {selectedSKU && (
        <div className="mt-6 bg-white rounded-lg shadow">
          <div className="px-6 py-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Assign Position for: {selectedSKU.productName}
            </h4>
            <p className="text-xs text-gray-600 mb-3">
              Warehouse: {selectedSKU.warehouse?.name}
            </p>
            <div className="flex space-x-2">
              <input
                type="text"
                value={warehousePosition}
                onChange={(e) => setWarehousePosition(e.target.value)}
                placeholder="e.g., A01-1-1"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAssignPosition}
                disabled={!warehousePosition}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Assign Position
              </button>
              <button
                onClick={() => {
                  setSelectedSKU(null);
                  setWarehousePosition('');
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Move Backward Modal */}
      {moveBackwardModal.isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Move SKU Backward
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Move "{moveBackwardModal.sku?.productName}" back to the capacity queue.
            </p>
            <textarea
              value={moveBackwardModal.reason}
              onChange={(e) => setMoveBackwardModal({ ...moveBackwardModal, reason: e.target.value })}
              placeholder="Please provide a reason..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-4"
              rows={3}
              required
            />
            <div className="flex space-x-3">
              <button
                onClick={handleMoveBackward}
                disabled={!moveBackwardModal.reason}
                className="flex-1 px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 disabled:opacity-50"
              >
                Move Backward
              </button>
              <button
                onClick={() => setMoveBackwardModal({ isOpen: false, sku: null, reason: '' })}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};