import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Package, AlertTriangle, Clock, GripVertical, X, Lock } from 'lucide-react';
import { skuService } from '../../services/skuService';
import { SKU, SKUState } from '../../types/SKUManagement';

export const CapacityQueue: React.FC = () => {
  const [skus, setSKUs] = useState<SKU[]>([]);
  const [cancelModal, setCancelModal] = useState<{
    isOpen: boolean;
    sku: SKU | null;
    reason: string;
  }>({ isOpen: false, sku: null, reason: '' });

  useEffect(() => {
    loadSKUs();
    const unsubscribe = skuService.subscribe(loadSKUs);
    
    // Simulate capacity checks every 30 seconds
    const interval = setInterval(simulateCapacityCheck, 30000);
    
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const loadSKUs = () => {
    const waitingSKUs = skuService.getSKUs(SKUState.WAITING_FOR_CAPACITY);
    setSKUs(waitingSKUs.sort((a, b) => (a.queuePosition || 0) - (b.queuePosition || 0)));
  };

  const simulateCapacityCheck = () => {
    const waitingSKUs = skuService.getSKUs(SKUState.WAITING_FOR_CAPACITY);
    if (waitingSKUs.length > 0 && Math.random() > 0.7) {
      // 30% chance of capacity becoming available
      const nextSKU = waitingSKUs[0];
      const warehouses = ['Prague Central', 'Brno Distribution', 'Ostrava Hub'];
      const selectedWarehouse = warehouses[Math.floor(Math.random() * warehouses.length)];
      
      skuService.progressToWarehouseAssignment(
        nextSKU.id,
        `WH-${selectedWarehouse.replace(' ', '-')}`,
        selectedWarehouse
      );
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;

    if (sourceIndex === destIndex) return;

    const draggedSKU = skus[sourceIndex];
    if (draggedSKU.lockedForReordering) {
      alert('This SKU is locked and cannot be reordered.');
      return;
    }

    skuService.reorderQueue(draggedSKU.id, destIndex + 1, 'current-user');
  };

  const handleCancel = () => {
    if (cancelModal.sku && cancelModal.reason) {
      skuService.cancelSKU(cancelModal.sku.id, 'current-user', cancelModal.reason);
      setCancelModal({ isOpen: false, sku: null, reason: '' });
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
        <h2 className="text-xl font-semibold text-gray-900">Capacity Queue Management</h2>
        <p className="mt-1 text-sm text-gray-600">
          Manage the queue of approved SKUs waiting for warehouse capacity. Drag to reorder.
        </p>
      </div>

      {/* Queue Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Package className="h-10 w-10 text-blue-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">SKUs in Queue</p>
              <p className="text-2xl font-bold text-gray-900">{skus.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Clock className="h-10 w-10 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Avg. Wait Time</p>
              <p className="text-2xl font-bold text-gray-900">2.5 days</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-10 w-10 text-orange-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Locked SKUs</p>
              <p className="text-2xl font-bold text-gray-900">
                {skus.filter(s => s.lockedForReordering).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Queue List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Queue Order</h3>
        </div>
        
        {skus.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p>No SKUs waiting for capacity</p>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="capacity-queue">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="p-4 space-y-2"
                >
                  {skus.map((sku, index) => (
                    <Draggable 
                      key={sku.id} 
                      draggableId={sku.id} 
                      index={index}
                      isDragDisabled={sku.lockedForReordering}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`bg-white border rounded-lg p-4 ${
                            snapshot.isDragging ? 'shadow-lg' : 'shadow'
                          } ${sku.lockedForReordering ? 'opacity-75' : ''}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div {...provided.dragHandleProps}>
                                {sku.lockedForReordering ? (
                                  <Lock className="h-5 w-5 text-gray-400" />
                                ) : (
                                  <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  #{sku.queuePosition}
                                </span>
                                {sku.lockedForReordering && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    Processing
                                  </span>
                                )}
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-900">
                                  {sku.productName}
                                </h4>
                                <p className="text-xs text-gray-500">
                                  {sku.supplier} • SKU: {sku.id}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <p className="text-xs text-gray-500">Approved</p>
                                <p className="text-sm text-gray-900">
                                  {formatDate(sku.approvedAt)}
                                </p>
                              </div>
                              {!sku.lockedForReordering && (
                                <button
                                  onClick={() => setCancelModal({ 
                                    isOpen: true, 
                                    sku, 
                                    reason: '' 
                                  })}
                                  className="p-1 text-red-600 hover:text-red-800"
                                >
                                  <X className="h-5 w-5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      {/* Cancel Modal */}
      {cancelModal.isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Cancel SKU
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to cancel "{cancelModal.sku?.productName}"?
            </p>
            <textarea
              value={cancelModal.reason}
              onChange={(e) => setCancelModal({ ...cancelModal, reason: e.target.value })}
              placeholder="Please provide a reason for cancellation..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-4"
              rows={3}
              required
            />
            <div className="flex space-x-3">
              <button
                onClick={handleCancel}
                disabled={!cancelModal.reason}
                className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                Cancel SKU
              </button>
              <button
                onClick={() => setCancelModal({ isOpen: false, sku: null, reason: '' })}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400"
              >
                Keep SKU
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};