import React, { useState, useEffect } from 'react';
import { 
  Truck, Plus, CheckCircle, Clock, AlertTriangle, 
  Settings, Link as LinkIcon, RefreshCw, Edit3, Trash2 
} from 'lucide-react';
import { supplyChainService } from '../../services/supplyChainService';

interface EDIConnection {
  id: string;
  supplierName: string;
  connectionType: 'ORDERS' | 'INVOICES' | 'CONFIRMATIONS';
  status: 'connected' | 'pending' | 'error';
  lastSync?: string;
  endpoint?: string;
  credentials?: {
    username: string;
    password: string;
    testMode: boolean;
  };
}

export const EDIConnections: React.FC = () => {
  const [connections, setConnections] = useState<EDIConnection[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<EDIConnection | null>(null);
  const [formData, setFormData] = useState({
    supplierName: '',
    connectionType: 'ORDERS' as EDIConnection['connectionType'],
    endpoint: '',
    username: '',
    password: '',
    testMode: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadConnections();

    const unsubscribe = supplyChainService.onTaskUpdate(() => {
      loadConnections();
    });

    return unsubscribe;
  }, []);

  const loadConnections = () => {
    setConnections(supplyChainService.getEDIConnections());
  };

  const handleCreateConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const success = supplyChainService.createEDIConnection({
        supplierName: formData.supplierName,
        connectionType: formData.connectionType,
        status: 'pending',
        endpoint: formData.endpoint,
        credentials: {
          username: formData.username,
          password: formData.password,
          testMode: formData.testMode
        }
      });

      if (success) {
        alert(`✅ EDI connection created for ${formData.supplierName}`);
        setShowCreateForm(false);
        setFormData({
          supplierName: '',
          connectionType: 'ORDERS',
          endpoint: '',
          username: '',
          password: '',
          testMode: true
        });
      } else {
        alert('❌ Failed to create EDI connection. Please try again.');
      }
    } catch (error) {
      alert('❌ Error creating EDI connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestConnection = async (connection: EDIConnection) => {
    setIsSubmitting(true);
    
    // Simulate testing
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% success rate for demo
      
      if (success) {
        supplyChainService.updateEDIConnectionStatus(connection.id, 'connected', 'current-user');
        alert(`✅ Connection to ${connection.supplierName} established successfully`);
      } else {
        supplyChainService.updateEDIConnectionStatus(connection.id, 'error', 'current-user');
        alert(`❌ Connection to ${connection.supplierName} failed. Please check credentials.`);
      }
      setIsSubmitting(false);
    }, 2000);
  };

  const handleSyncConnection = async (connection: EDIConnection) => {
    if (connection.status !== 'connected') return;
    
    setIsSubmitting(true);
    
    // Simulate sync
    setTimeout(() => {
      supplyChainService.updateEDIConnectionStatus(connection.id, 'connected', 'current-user');
      alert(`✅ Sync completed for ${connection.supplierName}`);
      setIsSubmitting(false);
    }, 1500);
  };

  const getStatusColor = (status: EDIConnection['status']) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: EDIConnection['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatLastSync = (lastSync?: string) => {
    if (!lastSync) return 'Never';
    return new Date(lastSync).toLocaleString('cs-CZ');
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">EDI Connections</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage EDI connections with suppliers for automated order processing.
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Connection
        </button>
      </div>

      {/* Connection Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Connected</p>
              <p className="text-2xl font-bold text-gray-900">
                {connections.filter(c => c.status === 'connected').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Clock className="h-6 w-6 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {connections.filter(c => c.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Errors</p>
              <p className="text-2xl font-bold text-gray-900">
                {connections.filter(c => c.status === 'error').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Connections List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">EDI Connections ({connections.length})</h3>
        </div>
        
        <div className="overflow-hidden">
          {connections.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Truck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No EDI Connections</h3>
              <p>Create your first EDI connection to start automated supplier communication.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {connections.map((connection) => (
                <div key={connection.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(connection.status)}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {connection.supplierName}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(connection.status)}`}>
                            {connection.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {connection.connectionType}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Last sync: {formatLastSync(connection.lastSync)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {connection.status === 'pending' && (
                        <button
                          onClick={() => handleTestConnection(connection)}
                          disabled={isSubmitting}
                          className="inline-flex items-center px-3 py-1 border border-green-300 text-xs font-medium rounded text-green-700 bg-green-50 hover:bg-green-100 disabled:opacity-50"
                        >
                          <LinkIcon className="w-3 h-3 mr-1" />
                          Test
                        </button>
                      )}
                      
                      {connection.status === 'connected' && (
                        <button
                          onClick={() => handleSyncConnection(connection)}
                          disabled={isSubmitting}
                          className="inline-flex items-center px-3 py-1 border border-blue-300 text-xs font-medium rounded text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-50"
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Sync
                        </button>
                      )}
                      
                      {connection.status === 'error' && (
                        <button
                          onClick={() => handleTestConnection(connection)}
                          disabled={isSubmitting}
                          className="inline-flex items-center px-3 py-1 border border-yellow-300 text-xs font-medium rounded text-yellow-700 bg-yellow-50 hover:bg-yellow-100 disabled:opacity-50"
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Retry
                        </button>
                      )}
                      
                      <button
                        onClick={() => setSelectedConnection(connection)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Settings className="w-3 h-3 mr-1" />
                        Settings
                      </button>
                    </div>
                  </div>
                  
                  {connection.endpoint && (
                    <div className="mt-2 text-xs text-gray-500">
                      Endpoint: {connection.endpoint}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Connection Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900">Create EDI Connection</h3>
            </div>
            
            <form onSubmit={handleCreateConnection} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.supplierName}
                  onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Connection Type
                </label>
                <select
                  value={formData.connectionType}
                  onChange={(e) => setFormData({ ...formData, connectionType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="ORDERS">Orders</option>
                  <option value="INVOICES">Invoices</option>
                  <option value="CONFIRMATIONS">Confirmations</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  EDI Endpoint URL
                </label>
                <input
                  type="url"
                  required
                  value={formData.endpoint}
                  onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                  placeholder="https://edi.supplier.com/api"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="testMode"
                  checked={formData.testMode}
                  onChange={(e) => setFormData({ ...formData, testMode: e.target.checked })}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="testMode" className="ml-2 text-sm text-gray-700">
                  Test mode (sandbox environment)
                </label>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    'Create Connection'
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