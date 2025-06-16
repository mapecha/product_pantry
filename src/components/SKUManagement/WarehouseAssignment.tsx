import React, { useState, useEffect } from 'react';
import { Package, MapPin, ArrowLeft, ArrowRight, CheckCircle, Warehouse } from 'lucide-react';
import { skuService } from '../../services/skuService';
import { SKU, SKUState } from '../../types/SKUManagement';

export const WarehouseAssignment: React.FC = () => {
  const [assignmentSKUs, setAssignmentSKUs] = useState<SKU[]>([]);
  const [waitingForOrderSKUs, setWaitingForOrderSKUs] = useState<SKU[]>([]);
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
    setWaitingForOrderSKUs(skuService.getSKUs(SKUState.WAITING_FOR_ORDER));
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

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Warehouse Assignment</h2>
        <p className="mt-1 text-sm text-gray-600">
          Assign warehouse positions to SKUs and manage their progression.
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
            <CheckCircle className="h-10 w-10 text-green-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Waiting for Order</p>
              <p className="text-2xl font-bold text-gray-900">{waitingForOrderSKUs.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Warehouse className="h-10 w-10 text-blue-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Assigned Today</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* SKUs Awaiting Position Assignment */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Awaiting Position Assignment</h3>
          </div>
          
          {assignmentSKUs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p>No SKUs awaiting position assignment</p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {assignmentSKUs.map((sku) => (
                <div
                  key={sku.id}
                  onClick={() => setSelectedSKU(sku)}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedSKU?.id === sku.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {sku.productName}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {sku.supplier} • {sku.warehouse?.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        SKU: {sku.id}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
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
          
          {/* Position Assignment Form */}
          {selectedSKU && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Assign Position for: {selectedSKU.productName}
              </h4>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={warehousePosition}
                  onChange={(e) => setWarehousePosition(e.target.value)}
                  placeholder="e.g., A01-1-1"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <button
                  onClick={handleAssignPosition}
                  disabled={!warehousePosition}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Assign
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SKUs Waiting for Order */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Waiting for Order</h3>
          </div>
          
          {waitingForOrderSKUs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p>No SKUs waiting for order</p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {waitingForOrderSKUs.map((sku) => (
                <div
                  key={sku.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {sku.productName}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {sku.supplier} • {sku.warehouse?.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Position: <span className="font-mono">{sku.warehouse?.position}</span>
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Ready for Order
                      </span>
                      <button
                        onClick={() => setMoveBackwardModal({ 
                          isOpen: true, 
                          sku, 
                          reason: '' 
                        })}
                        className="text-xs text-gray-500 hover:text-red-600"
                      >
                        <ArrowLeft className="w-3 h-3 inline mr-1" />
                        Move Back
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Assigned: {sku.warehouse?.assignedAt && formatDate(sku.warehouse.assignedAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Move Backward Modal */}
      {moveBackwardModal.isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Move SKU Backward
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Move "{moveBackwardModal.sku?.productName}" back to the previous state.
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