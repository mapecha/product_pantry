import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Plus, Package, DollarSign, Calendar, 
  CheckCircle, Clock, AlertTriangle, Send, Eye, Edit3 
} from 'lucide-react';
import { supplyChainService } from '../../services/supplyChainService';

interface FirstOrder {
  id: string;
  productId: string;
  productName: string;
  supplier: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  deliveryDate: string;
  status: 'draft' | 'sent' | 'confirmed' | 'delivered';
  orderNumber?: string;
  createdAt: string;
  createdBy: string;
}

export const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<FirstOrder[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<FirstOrder | null>(null);
  const [formData, setFormData] = useState({
    productId: '',
    productName: '',
    supplier: '',
    quantity: 100,
    unitPrice: 0,
    deliveryDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | FirstOrder['status']>('all');

  // Mock available products (in real app, this would come from the service)
  const [availableProducts] = useState([
    { id: 'prod-1', name: 'Organic Bananas', supplier: 'Fresh Foods Ltd' },
    { id: 'prod-2', name: 'Premium Coffee Beans', supplier: 'Coffee Masters Inc' },
    { id: 'prod-3', name: 'Greek Yogurt', supplier: 'Dairy Farm Co' }
  ]);

  useEffect(() => {
    loadOrders();

    const unsubscribe = supplyChainService.onTaskUpdate(() => {
      loadOrders();
    });

    // Set default delivery date to 30 days from now
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);
    setFormData(prev => ({
      ...prev,
      deliveryDate: defaultDate.toISOString().split('T')[0]
    }));

    return unsubscribe;
  }, []);

  const loadOrders = () => {
    setOrders(supplyChainService.getOrders());
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const success = supplyChainService.createFirstOrder({
        productId: formData.productId,
        productName: formData.productName,
        supplier: formData.supplier,
        quantity: formData.quantity,
        unitPrice: formData.unitPrice,
        totalAmount: formData.quantity * formData.unitPrice,
        deliveryDate: formData.deliveryDate,
        createdBy: 'current-user' // Would come from auth context
      });

      if (success) {
        alert(`✅ First order created for ${formData.productName}`);
        setShowCreateForm(false);
        setFormData({
          productId: '',
          productName: '',
          supplier: '',
          quantity: 100,
          unitPrice: 0,
          deliveryDate: ''
        });
      } else {
        alert('❌ Failed to create order. Please try again.');
      }
    } catch (error) {
      alert('❌ Error creating order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOrder = async (order: FirstOrder) => {
    if (order.status !== 'draft') return;
    
    setIsSubmitting(true);
    
    // Simulate sending order
    setTimeout(() => {
      const orderNumber = `ORD-${Date.now()}`;
      supplyChainService.updateOrderStatus(order.id, 'sent', 'current-user', orderNumber);
      alert(`✅ Order ${orderNumber} sent to ${order.supplier}`);
      setIsSubmitting(false);
    }, 1500);
  };

  const handleConfirmOrder = async (order: FirstOrder) => {
    if (order.status !== 'sent') return;
    
    setIsSubmitting(true);
    
    // Simulate supplier confirmation
    setTimeout(() => {
      supplyChainService.updateOrderStatus(order.id, 'confirmed', 'supplier-system');
      alert(`✅ Order ${order.orderNumber} confirmed by ${order.supplier}`);
      setIsSubmitting(false);
    }, 1000);
  };

  const handleProductSelect = (productId: string) => {
    const product = availableProducts.find(p => p.id === productId);
    if (product) {
      setFormData(prev => ({
        ...prev,
        productId: product.id,
        productName: product.name,
        supplier: product.supplier
      }));
    }
  };

  const getStatusColor = (status: FirstOrder['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: FirstOrder['status']) => {
    switch (status) {
      case 'draft':
        return <Edit3 className="h-4 w-4" />;
      case 'sent':
        return <Send className="h-4 w-4" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'delivered':
        return <Package className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('cs-CZ', { 
      style: 'currency', 
      currency: 'CZK' 
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ');
  };

  const filteredOrders = orders.filter(order => 
    filterStatus === 'all' || order.status === filterStatus
  );

  const orderStats = {
    total: orders.length,
    draft: orders.filter(o => o.status === 'draft').length,
    sent: orders.filter(o => o.status === 'sent').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    totalValue: orders.reduce((sum, order) => sum + order.totalAmount, 0)
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Create and manage first orders for products ready for market.
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Order
        </button>
      </div>

      {/* Order Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <ShoppingCart className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{orderStats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Send className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Sent</p>
              <p className="text-2xl font-bold text-gray-900">{orderStats.sent}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-gray-900">{orderStats.confirmed}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <DollarSign className="h-6 w-6 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(orderStats.totalValue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Orders List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Orders ({filteredOrders.length})</h3>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Orders</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="confirmed">Confirmed</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Found</h3>
              <p>Create your first order to start managing supplier orders.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Delivery
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.orderNumber || order.id.slice(-8)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(order.createdAt)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.productName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.supplier}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {order.quantity.toLocaleString()} units
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatCurrency(order.unitPrice)} each
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(order.deliveryDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1">{order.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {order.status === 'draft' && (
                            <button
                              onClick={() => handleSendOrder(order)}
                              disabled={isSubmitting}
                              className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                            >
                              Send
                            </button>
                          )}
                          {order.status === 'sent' && (
                            <button
                              onClick={() => handleConfirmOrder(order)}
                              disabled={isSubmitting}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50"
                            >
                              Confirm
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Order Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900">Create First Order</h3>
            </div>
            
            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product
                </label>
                <select
                  required
                  value={formData.productId}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Select a product</option>
                  {availableProducts.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {product.supplier}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Price (CZK)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.deliveryDate}
                  onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              
              {formData.quantity > 0 && formData.unitPrice > 0 && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">
                    <strong>Total Amount:</strong> {formatCurrency(formData.quantity * formData.unitPrice)}
                  </div>
                </div>
              )}
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.productId}
                  className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    'Create Order'
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};