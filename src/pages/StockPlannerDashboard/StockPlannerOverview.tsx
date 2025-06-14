import React, { useState, useEffect } from 'react';
import { Warehouse, Package, Clock, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { warehouseAssignmentService } from '../../services/warehouseAssignmentService';
import { warehouseService } from '../../services/warehouseService';

export const StockPlannerOverview: React.FC = () => {
  const [assignmentStats, setAssignmentStats] = useState({
    pending: 0,
    assigned: 0,
    avgProcessingTime: 0,
    byPriority: {} as Record<string, number>,
    byWarehouse: {} as Record<string, number>
  });
  const [capacitySummary, setCapacitySummary] = useState({ total: 0, used: 0, available: 0 });

  useEffect(() => {
    // Load initial data
    updateStats();

    // Subscribe to assignment events
    const unsubscribe = warehouseAssignmentService.onAssignment(() => {
      updateStats();
    });

    // Subscribe to capacity changes
    const capacityUnsubscribe = warehouseService.startAutomatedChecking(() => {
      updateCapacitySummary();
    });

    return () => {
      unsubscribe();
      capacityUnsubscribe();
    };
  }, []);

  const updateStats = () => {
    setAssignmentStats(warehouseAssignmentService.getAssignmentStats());
    updateCapacitySummary();
  };

  const updateCapacitySummary = () => {
    const summary = warehouseService.getCapacitySummary();
    setCapacitySummary(summary);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Stock Planner Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-orange-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending Assignments
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {assignmentStats.pending}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/stock-planner/assignments" className="font-medium text-blue-600 hover:text-blue-500">
                Assign positions
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Assigned Today
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {assignmentStats.assigned}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/stock-planner/history" className="font-medium text-blue-600 hover:text-blue-500">
                View history
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Avg Processing Time
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {assignmentStats.avgProcessingTime}m
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-gray-500">Average assignment time</span>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Warehouse className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Available Capacity
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {capacitySummary.available}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/stock-planner/capacity" className="font-medium text-blue-600 hover:text-blue-500">
                Manage capacity
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Priority Breakdown */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Priority Breakdown
            </h3>
            <div className="space-y-3">
              {Object.entries(assignmentStats.byPriority).map(([priority, count]) => (
                <div key={priority} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getPriorityColor(priority)}`}>
                      {priority}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{count} items</span>
                </div>
              ))}
              {Object.keys(assignmentStats.byPriority).length === 0 && (
                <p className="text-sm text-gray-500">No pending assignments</p>
              )}
            </div>
          </div>
        </div>

        {/* Warehouse Distribution */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Warehouse Distribution
            </h3>
            <div className="space-y-3">
              {Object.entries(assignmentStats.byWarehouse).map(([warehouse, count]) => (
                <div key={warehouse} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Warehouse className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">{warehouse}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{count} items</span>
                </div>
              ))}
              {Object.keys(assignmentStats.byWarehouse).length === 0 && (
                <p className="text-sm text-gray-500">No pending assignments</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/stock-planner/assignments"
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-200 hover:border-gray-300"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-600 group-hover:bg-blue-100">
                  <Package className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Assign Positions
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Assign warehouse positions to pending products
                </p>
              </div>
            </Link>

            <Link
              to="/stock-planner/capacity"
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-200 hover:border-gray-300"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-600 group-hover:bg-green-100">
                  <Warehouse className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Capacity Management
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Monitor and manage warehouse capacity
                </p>
              </div>
            </Link>

            <Link
              to="/stock-planner/history"
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-200 hover:border-gray-300"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-600 group-hover:bg-purple-100">
                  <Clock className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Assignment History
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Review assignment history and audit logs
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};