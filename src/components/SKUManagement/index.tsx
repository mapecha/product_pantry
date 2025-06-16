import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Package, AlertTriangle, Clock, MapPin, X, ArrowUpDown, History } from 'lucide-react';
import { skuService } from '../../services/skuService';
import { SKU, SKUState } from '../../types/SKUManagement';
import { CapacityQueue } from './CapacityQueue';
import { WarehouseAssignment } from './WarehouseAssignment';
import { AuditHistory } from './AuditHistory';

type View = 'commercial' | 'stock-planner' | 'history';

export const SKUManagement: React.FC = () => {
  const [view, setView] = useState<View>('commercial');
  const [skus, setSKUs] = useState<SKU[]>([]);
  const [selectedSKU, setSelectedSKU] = useState<SKU | null>(null);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">SKU Management</h1>
            
            {/* Role Switcher */}
            <div className="flex space-x-4">
              <button
                onClick={() => setView('commercial')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  view === 'commercial'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Commercial View
              </button>
              <button
                onClick={() => setView('stock-planner')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  view === 'stock-planner'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Stock Planner View
              </button>
              <button
                onClick={() => setView('history')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  view === 'history'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <History className="w-4 h-4 inline mr-1" />
                History
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </div>
    </div>
  );
};