import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { 
  GripVertical, X, AlertCircle, Package, Calendar, User, 
  Warehouse, Clock, RefreshCw, TrendingUp, CheckSquare 
} from 'lucide-react';
import { queueService, QueueProduct } from '../../services/queueService';
import { warehouseService } from '../../services/warehouseService';
import { UserRole } from '../../types/Workflow';

export const QueueManagement: React.FC = () => {
  const [queueItems, setQueueItems] = useState<QueueProduct[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [capacitySummary, setCapacitySummary] = useState({ total: 0, used: 0, available: 0 });
  const [queueStats, setQueueStats] = useState({ total: 0, waiting: 0, locked: 0, avgWaitTime: 0 });
  const [lastCapacityCheck, setLastCapacityCheck] = useState<Date | null>(null);

  useEffect(() => {
    // Load initial queue
    loadQueue();

    // Subscribe to progression events
    const unsubscribe = queueService.onProgression((product) => {
      loadQueue();
      alert(`Product "${product.productName}" has been assigned to warehouse!`);
    });

    // Set up capacity check listener
    const capacityUnsubscribe = warehouseService.startAutomatedChecking(() => {
      setLastCapacityCheck(new Date());
      updateCapacitySummary();
      loadQueue(); // Reload queue after capacity check
    });

    return () => {
      unsubscribe();
      capacityUnsubscribe();
    };
  }, []);

  const loadQueue = () => {
    const items = queueService.getQueue();
    setQueueItems(items);
    setQueueStats(queueService.getQueueStats());
    updateCapacitySummary();
    setIsLoading(false);
  };

  const updateCapacitySummary = () => {
    const summary = warehouseService.getCapacitySummary();
    setCapacitySummary(summary);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    
    if (sourceIndex === destIndex) return;

    const draggedItem = queueItems[sourceIndex];
    
    // Check if item is locked
    if (draggedItem.lockedForReordering) {
      alert('This item cannot be reordered as warehouse assignment has already started.');
      return;
    }

    // Reorder in service
    const success = queueService.reorderQueue(
      draggedItem.id, 
      destIndex + 1,
      'current-user' // Would come from auth context
    );

    if (success) {
      loadQueue();
    }
  };

  const handleRemoveFromQueue = (itemId: string) => {
    const item = queueItems.find(i => i.id === itemId);
    if (!item) return;

    const reason = prompt('Please provide a reason for removing this product from the queue:');
    if (!reason) return;

    const success = queueService.removeFromQueue(
      itemId,
      'current-user', // Would come from auth context
      reason
    );

    if (success) {
      loadQueue();
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleBulkRemove = () => {
    if (selectedItems.size === 0) return;
    
    const reason = prompt('Please provide a reason for removing these products from the queue:');
    if (!reason) return;

    let removed = 0;
    selectedItems.forEach(itemId => {
      if (queueService.removeFromQueue(itemId, 'current-user', reason)) {
        removed++;
      }
    });

    alert(`${removed} products removed from queue`);
    setSelectedItems(new Set());
    loadQueue();
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.size === queueItems.filter(i => !i.lockedForReordering).length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(
        queueItems.filter(i => !i.lockedForReordering).map(i => i.id)
      ));
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

  const formatWaitTime = (approvedAt: string) => {
    const wait = new Date().getTime() - new Date(approvedAt).getTime();
    const hours = Math.floor(wait / 1000 / 60 / 60);
    const minutes = Math.floor((wait / 1000 / 60) % 60);
    return `${hours}h ${minutes}m`;
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading queue...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Capacity Queue Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage the order of products waiting for warehouse capacity. Drag to reorder.
          </p>
        </div>
        
        {/* Queue Stats */}
        <div className="bg-white rounded-lg shadow p-4 space-y-2">
          <div className="text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>Queue Length:</span>
              <span className="font-medium">{queueStats.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Avg Wait Time:</span>
              <span className="font-medium">{queueStats.avgWaitTime}m</span>
            </div>
            {lastCapacityCheck && (
              <div className="flex items-center justify-between">
                <span>Last Check:</span>
                <span className="font-medium">
                  {new Date(lastCapacityCheck).toLocaleTimeString('cs-CZ')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Capacity Overview */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Capacity</p>
              <p className="text-2xl font-bold">{capacitySummary.total}</p>
            </div>
            <Warehouse className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Used</p>
              <p className="text-2xl font-bold text-orange-600">{capacitySummary.used}</p>
            </div>
            <Package className="h-8 w-8 text-orange-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-2xl font-bold text-green-600">{capacitySummary.available}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-400" />
          </div>
        </div>
      </div>

      {queueItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No products in queue</h3>
          <p className="mt-1 text-sm text-gray-500">
            Approved products will appear here waiting for warehouse capacity.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Products in Queue ({queueItems.length})
                </h3>
                {selectedItems.size > 0 && (
                  <span className="text-sm text-gray-500">
                    {selectedItems.size} selected
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {selectedItems.size > 0 && (
                  <button
                    onClick={handleBulkRemove}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  >
                    Remove Selected
                  </button>
                )}
                <button
                  onClick={handleSelectAll}
                  className="px-3 py-1 border border-gray-300 text-sm rounded hover:bg-gray-50"
                >
                  {selectedItems.size === queueItems.filter(i => !i.lockedForReordering).length 
                    ? 'Deselect All' 
                    : 'Select All'}
                </button>
              </div>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="queue">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {queueItems.map((item, index) => (
                      <Draggable
                        key={item.id}
                        draggableId={item.id}
                        index={index}
                        isDragDisabled={item.lockedForReordering}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`mb-3 rounded-lg border ${
                              snapshot.isDragging 
                                ? 'border-blue-400 shadow-lg' 
                                : 'border-gray-200'
                            } ${
                              item.lockedForReordering 
                                ? 'bg-gray-50 opacity-60' 
                                : 'bg-white'
                            }`}
                          >
                            <div className="p-4">
                              <div className="flex items-center">
                                {!item.lockedForReordering && (
                                  <input
                                    type="checkbox"
                                    checked={selectedItems.has(item.id)}
                                    onChange={() => handleSelectItem(item.id)}
                                    className="mr-3 h-4 w-4 text-blue-600 rounded"
                                  />
                                )}
                                
                                <div
                                  {...provided.dragHandleProps}
                                  className={`mr-3 ${
                                    item.lockedForReordering 
                                      ? 'text-gray-300 cursor-not-allowed' 
                                      : 'text-gray-400 cursor-move'
                                  }`}
                                >
                                  <GripVertical className="h-5 w-5" />
                                </div>

                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="flex items-center space-x-3">
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                          #{item.queuePosition}
                                        </span>
                                        <h4 className="text-sm font-medium text-gray-900">
                                          {item.productName}
                                        </h4>
                                        {item.lockedForReordering && (
                                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                            <AlertCircle className="w-3 h-3 mr-1" />
                                            Processing
                                          </span>
                                        )}
                                      </div>
                                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                                        <span className="flex items-center">
                                          <Package className="w-4 h-4 mr-1" />
                                          {item.supplier}
                                        </span>
                                        <span className="flex items-center">
                                          <Calendar className="w-4 h-4 mr-1" />
                                          {formatDate(item.approvedAt)}
                                        </span>
                                        <span className="flex items-center">
                                          <Clock className="w-4 h-4 mr-1" />
                                          Wait: {formatWaitTime(item.approvedAt)}
                                        </span>
                                        <span className="flex items-center">
                                          <User className="w-4 h-4 mr-1" />
                                          {item.approvedBy}
                                        </span>
                                      </div>
                                    </div>

                                    {!item.lockedForReordering && (
                                      <button
                                        onClick={() => handleRemoveFromQueue(item.id)}
                                        className="ml-4 p-1 text-red-400 hover:text-red-600"
                                        title="Remove from queue"
                                      >
                                        <X className="h-5 w-5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
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

            {/* Automated processing indicator */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center text-sm text-blue-800">
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Automated capacity checking is active. Products will progress automatically when capacity becomes available.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};