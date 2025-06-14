import React, { useState, useEffect } from 'react';
import { Truck, Package, CheckCircle, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supplyChainService } from '../../services/supplyChainService';

export const SupplyChainOverview: React.FC = () => {
  const [stats, setStats] = useState({
    pendingTasks: 0,
    completedToday: 0,
    avgTaskTime: 0,
    readyProducts: 0,
    ediConnections: 0,
    activeOrders: 0
  });

  const [recentActivity, setRecentActivity] = useState<Array<{
    id: string;
    type: string;
    productName: string;
    action: string;
    timestamp: string;
    status: 'completed' | 'pending' | 'error';
  }>>([]);

  useEffect(() => {
    loadStats();
    loadRecentActivity();

    const unsubscribe = supplyChainService.onTaskUpdate(() => {
      loadStats();
      loadRecentActivity();
    });

    return unsubscribe;
  }, []);

  const loadStats = () => {
    setStats(supplyChainService.getSupplyChainStats());
  };

  const loadRecentActivity = () => {
    setRecentActivity(supplyChainService.getRecentActivity());
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Supply Chain Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-orange-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending Tasks
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.pendingTasks}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/supply-chain/tasks" className="font-medium text-blue-600 hover:text-blue-500">
                Manage tasks
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
                    Completed Today
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.completedToday}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/supply-chain/history" className="font-medium text-blue-600 hover:text-blue-500">
                View history
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Ready for Orders
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.readyProducts}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/supply-chain/orders" className="font-medium text-blue-600 hover:text-blue-500">
                Create orders
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3">
                    {getStatusIcon(activity.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">
                        <span className="font-medium">{activity.productName}</span> - {activity.action}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString('cs-CZ')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No recent activity</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link
                to="/supply-chain/tasks"
                className="relative group bg-white p-4 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-200 hover:border-gray-300 flex items-center space-x-3"
              >
                <span className="rounded-lg inline-flex p-2 bg-blue-50 text-blue-600 group-hover:bg-blue-100">
                  <Clock className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    Manage Tasks
                  </h4>
                  <p className="text-xs text-gray-500">
                    Complete EDI connections and order tasks
                  </p>
                </div>
              </Link>

              <Link
                to="/supply-chain/edi"
                className="relative group bg-white p-4 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-200 hover:border-gray-300 flex items-center space-x-3"
              >
                <span className="rounded-lg inline-flex p-2 bg-green-50 text-green-600 group-hover:bg-green-100">
                  <Truck className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    EDI Connections
                  </h4>
                  <p className="text-xs text-gray-500">
                    Setup and manage EDI connections
                  </p>
                </div>
              </Link>

              <Link
                to="/supply-chain/orders"
                className="relative group bg-white p-4 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-200 hover:border-gray-300 flex items-center space-x-3"
              >
                <span className="rounded-lg inline-flex p-2 bg-purple-50 text-purple-600 group-hover:bg-purple-100">
                  <Package className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    Order Management
                  </h4>
                  <p className="text-xs text-gray-500">
                    Create and manage first orders
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};