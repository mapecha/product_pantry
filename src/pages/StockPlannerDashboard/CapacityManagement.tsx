import React, { useState, useEffect } from 'react';
import { Warehouse, TrendingUp, Package, MapPin, RefreshCw } from 'lucide-react';
import { warehouseService, Warehouse as WarehouseType } from '../../services/warehouseService';
import { warehouseAssignmentService, WarehousePosition } from '../../services/warehouseAssignmentService';

export const CapacityManagement: React.FC = () => {
  const [warehouses, setWarehouses] = useState<WarehouseType[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseType | null>(null);
  const [warehousePositions, setWarehousePositions] = useState<WarehousePosition[]>([]);
  const [lastCapacityCheck, setLastCapacityCheck] = useState<Date | null>(null);
  const [filterOccupied, setFilterOccupied] = useState<'all' | 'available' | 'occupied'>('all');
  const [searchSection, setSearchSection] = useState('');

  useEffect(() => {
    loadWarehouses();

    // Subscribe to capacity changes
    const unsubscribe = warehouseService.startAutomatedChecking(() => {
      setLastCapacityCheck(new Date());
      loadWarehouses();
      if (selectedWarehouse) {
        loadWarehousePositions(selectedWarehouse.id);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (selectedWarehouse) {
      loadWarehousePositions(selectedWarehouse.id);
    }
  }, [selectedWarehouse]);

  const loadWarehouses = () => {
    const warehouseList = warehouseService.getWarehouses();
    setWarehouses(warehouseList);
  };

  const loadWarehousePositions = (warehouseId: string) => {
    const positions = warehouseAssignmentService.getWarehousePositions(warehouseId);
    setWarehousePositions(positions);
  };

  const getCapacityColor = (used: number, total: number) => {
    const percentage = (used / total) * 100;
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getCapacityStatus = (used: number, total: number) => {
    const percentage = (used / total) * 100;
    if (percentage >= 90) return 'Critical';
    if (percentage >= 75) return 'High';
    if (percentage >= 50) return 'Medium';
    return 'Low';
  };

  // Filter positions
  const filteredPositions = warehousePositions.filter(position => {
    const matchesOccupancy = 
      filterOccupied === 'all' ||
      (filterOccupied === 'occupied' && position.occupied) ||
      (filterOccupied === 'available' && !position.occupied);
    
    const matchesSection = !searchSection || 
      position.section.toLowerCase().includes(searchSection.toLowerCase()) ||
      position.aisle.includes(searchSection) ||
      position.shelf.includes(searchSection);
    
    return matchesOccupancy && matchesSection;
  });

  // Group positions by section
  const positionsBySection = filteredPositions.reduce((acc, position) => {
    if (!acc[position.section]) {
      acc[position.section] = [];
    }
    acc[position.section].push(position);
    return acc;
  }, {} as Record<string, WarehousePosition[]>);

  return (
    <div>
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Capacity Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Monitor warehouse capacity and position utilization.
          </p>
        </div>
        
        {lastCapacityCheck && (
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center text-sm text-gray-600">
              <RefreshCw className="w-4 h-4 mr-2" />
              Last updated: {lastCapacityCheck.toLocaleTimeString('cs-CZ')}
            </div>
          </div>
        )}
      </div>

      {/* Warehouse Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {warehouses.map((warehouse) => {
          const capacityPercentage = (warehouse.usedCapacity / warehouse.totalCapacity) * 100;
          return (
            <div
              key={warehouse.id}
              onClick={() => setSelectedWarehouse(warehouse)}
              className={`bg-white rounded-lg shadow cursor-pointer transition-all ${
                selectedWarehouse?.id === warehouse.id 
                  ? 'ring-2 ring-blue-500 shadow-lg' 
                  : 'hover:shadow-md'
              }`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Warehouse className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{warehouse.name}</h3>
                      <p className="text-sm text-gray-500">{warehouse.location}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    capacityPercentage >= 90 ? 'bg-red-100 text-red-800' :
                    capacityPercentage >= 75 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {getCapacityStatus(warehouse.usedCapacity, warehouse.totalCapacity)}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Capacity Usage</span>
                    <span className="font-medium">
                      {warehouse.usedCapacity} / {warehouse.totalCapacity}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getCapacityColor(warehouse.usedCapacity, warehouse.totalCapacity)}`}
                      style={{ width: `${capacityPercentage}%` }}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Available</span>
                      <p className="font-medium text-green-600">{warehouse.availableCapacity}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Utilization</span>
                      <p className="font-medium">{capacityPercentage.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Position View */}
      {selectedWarehouse && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedWarehouse.name} - Position Details
              </h3>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Search section/aisle..."
                    value={searchSection}
                    onChange={(e) => setSearchSection(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                  />
                  
                  <select
                    value={filterOccupied}
                    onChange={(e) => setFilterOccupied(e.target.value as any)}
                    className="border border-gray-300 rounded px-3 py-1 text-sm"
                  >
                    <option value="all">All Positions</option>
                    <option value="available">Available Only</option>
                    <option value="occupied">Occupied Only</option>
                  </select>
                </div>
                
                <div className="text-sm text-gray-600">
                  {filteredPositions.length} positions
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {Object.keys(positionsBySection).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p>No positions found matching your criteria</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(positionsBySection).map(([section, positions]) => {
                  const occupiedCount = positions.filter(p => p.occupied).length;
                  const totalCount = positions.length;
                  const sectionUtilization = (occupiedCount / totalCount) * 100;

                  return (
                    <div key={section} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-md font-medium text-gray-900">
                          Section {section}
                        </h4>
                        <div className="text-sm text-gray-600">
                          {occupiedCount} / {totalCount} occupied ({sectionUtilization.toFixed(1)}%)
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                        {positions.map((position) => (
                          <div
                            key={position.id}
                            className={`p-3 border rounded text-center text-xs ${
                              position.occupied 
                                ? 'border-red-200 bg-red-50 text-red-700' 
                                : 'border-green-200 bg-green-50 text-green-700'
                            }`}
                          >
                            <div className="font-mono font-medium">
                              {position.aisle}-{position.shelf}-{position.position}
                            </div>
                            <div className="mt-1">
                              {position.occupied ? (
                                <span className="flex items-center justify-center">
                                  <Package className="w-3 h-3 mr-1" />
                                  Occupied
                                </span>
                              ) : (
                                <span className="text-green-600">Available</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {!selectedWarehouse && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Warehouse className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Select a Warehouse
          </h3>
          <p className="text-sm text-gray-500">
            Click on a warehouse above to view detailed position information.
          </p>
        </div>
      )}
    </div>
  );
};