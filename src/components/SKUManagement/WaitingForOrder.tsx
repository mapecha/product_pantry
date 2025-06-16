import React, { useState, useEffect } from 'react';
import { Package, ArrowLeft, CheckCircle, ShoppingCart } from 'lucide-react';
import { skuService } from '../../services/skuService';
import { SKU, SKUState } from '../../types/SKUManagement';

export const WaitingForOrder: React.FC = () => {
  const [waitingForOrderSKUs, setWaitingForOrderSKUs] = useState<SKU[]>([]);
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
    setWaitingForOrderSKUs(skuService.getSKUs(SKUState.WAITING_FOR_ORDER));
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
        <h2 className="text-xl font-semibold text-gray-900">Waiting for Order</h2>
        <p className="mt-1 text-sm text-gray-600">
          SKUs that have been assigned warehouse positions and are ready for ordering.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <CheckCircle className="h-10 w-10 text-green-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Ready for Order</p>
              <p className="text-2xl font-bold text-gray-900">{waitingForOrderSKUs.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <ShoppingCart className="h-10 w-10 text-blue-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Orders Today</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Package className="h-10 w-10 text-purple-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Avg. Lead Time</p>
              <p className="text-2xl font-bold text-gray-900">3.2 days</p>
            </div>
          </div>
        </div>
      </div>

      {/* SKUs Ready for Order */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">SKUs Ready for Order</h3>
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
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {sku.productName}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {sku.supplier} • {sku.warehouse?.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      SKU: <span className="font-mono">{sku.id}</span> • 
                      Position: <span className="font-mono font-medium">{sku.warehouse?.position}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Assigned: {sku.warehouse?.assignedAt && formatDate(sku.warehouse.assignedAt)}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Ready for Order
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => alert('Order creation functionality would be implemented here')}
                        className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700"
                      >
                        Create Order
                      </button>
                      <button
                        onClick={() => setMoveBackwardModal({ 
                          isOpen: true, 
                          sku, 
                          reason: '' 
                        })}
                        className="px-2 py-1 text-xs text-gray-500 hover:text-red-600 border border-gray-300 rounded hover:border-red-300"
                      >
                        <ArrowLeft className="w-3 h-3 inline mr-1" />
                        Move Back
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Move Backward Modal */}
      {moveBackwardModal.isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Move SKU Backward
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Move "{moveBackwardModal.sku?.productName}" back to warehouse assignment.
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