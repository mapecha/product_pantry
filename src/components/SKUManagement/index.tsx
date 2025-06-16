import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, Clock, MapPin, X, ArrowUpDown, History, Users, Warehouse } from 'lucide-react';
import { skuService } from '../../services/skuService';
import { SKU, SKUState } from '../../types/SKUManagement';
import { CapacityQueue } from './CapacityQueue';
import { WarehouseAssignment } from './WarehouseAssignment';
import { AuditHistory } from './AuditHistory';

type View = 'commercial' | 'stock-planner' | 'history';

export const SKUManagement: React.FC = () => {
  const [view, setView] = useState<View>('commercial');
  const [skus, setSKUs] = useState<SKU[]>([]);

  useEffect(() => {
    loadSKUs();
    const unsubscribe = skuService.subscribe(loadSKUs);
    return unsubscribe;
  }, []);

  const loadSKUs = () => {
    setSKUs(skuService.getSKUs());
  };

  const renderContent = () => {
    switch (view) {
      case 'commercial':
        return <CapacityQueue />;
      case 'stock-planner':
        return <WarehouseAssignment />;
      case 'history':
        return <AuditHistory />;
      default:
        return null;
    }
  };

  const waitingCount = skus.filter(s => s.state === SKUState.WAITING_FOR_CAPACITY).length;
  const assignmentCount = skus.filter(s => s.state === SKUState.ASSIGN_WAREHOUSE_POSITION).length;
  const readyCount = skus.filter(s => s.state === SKUState.WAITING_FOR_ORDER).length;

  return (
    <div>
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">SKU Management</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage approved products through warehouse assignment to ready-for-order status
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="flex space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{waitingCount}</div>
              <div className="text-xs text-gray-500">Waiting</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{assignmentCount}</div>
              <div className="text-xs text-gray-500">Assigning</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{readyCount}</div>
              <div className="text-xs text-gray-500">Ready</div>
            </div>
          </div>
        </div>
      </div>

      {/* View Switcher */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setView('commercial')}
              className={`py-4 px-1 text-sm font-medium transition-colors relative flex items-center space-x-2 ${
                view === 'commercial'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Commercial Queue</span>
            </button>
            <button
              onClick={() => setView('stock-planner')}
              className={`py-4 px-1 text-sm font-medium transition-colors relative flex items-center space-x-2 ${
                view === 'stock-planner'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Warehouse className="w-4 h-4" />
              <span>Warehouse Assignment</span>
            </button>
            <button
              onClick={() => setView('history')}
              className={`py-4 px-1 text-sm font-medium transition-colors relative flex items-center space-x-2 ${
                view === 'history'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Audit History</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {renderContent()}
      </div>
    </div>
  );
};