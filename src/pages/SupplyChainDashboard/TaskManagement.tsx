import React, { useState, useEffect } from 'react';
import { 
  Package, CheckCircle, Clock, AlertTriangle, Truck, 
  ShoppingCart, User, Warehouse, MapPin, FileText 
} from 'lucide-react';
import { supplyChainService } from '../../services/supplyChainService';
import { TaskType } from '../../types/Workflow';

interface ProductWithTasks {
  id: string;
  productName: string;
  supplier: string;
  tasks: Array<{
    id: string;
    type: TaskType;
    status: 'pending' | 'in_progress' | 'completed';
    completedBy?: string;
    completedAt?: string;
    notes?: string;
  }>;
  assignedWarehouse?: string;
  warehousePosition?: string;
  receivedAt: string;
}

export const TaskManagement: React.FC = () => {
  const [products, setProducts] = useState<ProductWithTasks[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithTasks | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [taskNotes, setTaskNotes] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    loadProducts();

    const unsubscribe = supplyChainService.onTaskUpdate(() => {
      loadProducts();
    });

    return unsubscribe;
  }, []);

  const loadProducts = () => {
    const productsWaiting = supplyChainService.getProductsWaitingForOrder();
    setProducts(productsWaiting);
  };

  const handleCompleteTask = async () => {
    if (!selectedProduct || !selectedTaskId) return;

    setIsCompleting(true);
    try {
      const success = supplyChainService.completeTask(
        selectedProduct.id,
        selectedTaskId,
        'current-user', // Would come from auth context
        taskNotes
      );

      if (success) {
        alert(`✅ Task completed for ${selectedProduct.productName}`);
        setSelectedProduct(null);
        setSelectedTaskId('');
        setTaskNotes('');
      } else {
        alert('❌ Failed to complete task. Please try again.');
      }
    } catch (error) {
      alert('❌ Error completing task.');
    } finally {
      setIsCompleting(false);
    }
  };

  const getTaskIcon = (type: TaskType) => {
    switch (type) {
      case TaskType.EDI_CONNECTION:
        return <Truck className="w-5 h-5" />;
      case TaskType.FIRST_ORDER:
        return <ShoppingCart className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getTaskName = (type: TaskType) => {
    switch (type) {
      case TaskType.EDI_CONNECTION:
        return 'EDI Connection Setup';
      case TaskType.FIRST_ORDER:
        return 'First Order Creation';
      default:
        return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter products based on task status
  const filteredProducts = products.filter(product => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'completed') {
      return product.tasks.every(task => task.status === 'completed');
    }
    if (filterStatus === 'pending') {
      return product.tasks.some(task => task.status === 'pending');
    }
    return true;
  });

  return (
    <div>
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Complete EDI connections and first order tasks for products awaiting activation.
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">All Products</option>
            <option value="pending">Pending Tasks</option>
            <option value="completed">Completed Tasks</option>
          </select>
          
          <div className="text-sm text-gray-600">
            {filteredProducts.length} products
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Products List */}
        <div>
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Products Awaiting Tasks ({filteredProducts.length})
              </h3>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredProducts.map((product) => {
                  const pendingTasks = product.tasks.filter(t => t.status === 'pending').length;
                  const completedTasks = product.tasks.filter(t => t.status === 'completed').length;
                  const allCompleted = product.tasks.every(t => t.status === 'completed');

                  return (
                    <div
                      key={product.id}
                      onClick={() => setSelectedProduct(product)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedProduct?.id === product.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {allCompleted ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <Clock className="h-5 w-5 text-yellow-500" />
                            )}
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              allCompleted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {allCompleted ? 'Ready' : `${pendingTasks} pending`}
                            </span>
                          </div>
                          
                          <h4 className="text-sm font-medium text-gray-900 mb-1">
                            {product.productName}
                          </h4>
                          
                          <div className="text-xs text-gray-500 space-y-1">
                            <div className="flex items-center">
                              <Package className="w-3 h-3 mr-1" />
                              {product.supplier}
                            </div>
                            {product.assignedWarehouse && (
                              <div className="flex items-center">
                                <Warehouse className="w-3 h-3 mr-1" />
                                {product.assignedWarehouse}
                              </div>
                            )}
                            {product.warehousePosition && (
                              <div className="flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                Position: {product.warehousePosition}
                              </div>
                            )}
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              Received: {formatDate(product.receivedAt)}
                            </div>
                          </div>
                        </div>

                        <div className="text-right text-xs text-gray-500">
                          {completedTasks}/{product.tasks.length} tasks
                        </div>
                      </div>

                      {/* Task Progress Bar */}
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(completedTasks / product.tasks.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredProducts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p>No products found matching your criteria</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Task Details Panel */}
        <div>
          {selectedProduct ? (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Tasks: {selectedProduct.productName}
                </h3>
                
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">
                    <strong>Supplier:</strong> {selectedProduct.supplier}<br />
                    <strong>Warehouse:</strong> {selectedProduct.assignedWarehouse}<br />
                    <strong>Position:</strong> {selectedProduct.warehousePosition}<br />
                    <strong>Received:</strong> {formatDate(selectedProduct.receivedAt)}
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  {selectedProduct.tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-4 border rounded-lg ${
                        selectedTaskId === task.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={`mt-1 ${task.status === 'completed' ? 'text-green-600' : 'text-gray-400'}`}>
                            {getTaskIcon(task.type)}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">
                              {getTaskName(task.type)}
                            </h4>
                            {task.status === 'completed' && task.completedAt && (
                              <div className="mt-1 text-xs text-gray-500">
                                Completed by {task.completedBy} on {formatDate(task.completedAt)}
                                {task.notes && (
                                  <div className="mt-1 italic">"{task.notes}"</div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end space-y-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                          
                          {task.status === 'pending' && (
                            <button
                              onClick={() => setSelectedTaskId(task.id)}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedTaskId && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Complete Task
                    </h4>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Completion Notes (Optional)
                      </label>
                      <textarea
                        value={taskNotes}
                        onChange={(e) => setTaskNotes(e.target.value)}
                        placeholder="Add any notes about task completion..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={handleCompleteTask}
                        disabled={isCompleting}
                        className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isCompleting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Completing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Complete Task
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => {
                          setSelectedTaskId('');
                          setTaskNotes('');
                        }}
                        className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6 text-center">
                <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a Product
                </h3>
                <p className="text-sm text-gray-500">
                  Choose a product from the list to view and complete its supply chain tasks.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};