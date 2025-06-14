import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { queueService } from '../../services/queueService';
import { warehouseService } from '../../services/warehouseService';
import { AuditLog } from '../../components/shared/AuditLog';

export const CommercialOverview: React.FC = () => {
  const [queueStats, setQueueStats] = useState({ total: 0, waiting: 0, locked: 0, avgWaitTime: 0 });
  const [capacitySummary, setCapacitySummary] = useState({ total: 0, used: 0, available: 0 });

  useEffect(() => {
    // Load initial data
    updateStats();

    // Subscribe to queue changes
    const unsubscribe = queueService.onProgression(() => {
      updateStats();
    });

    // Subscribe to capacity changes
    const capacityUnsubscribe = warehouseService.startAutomatedChecking(() => {
      updateStats();
    });

    return () => {
      unsubscribe();
      capacityUnsubscribe();
    };
  }, []);

  const updateStats = () => {
    setQueueStats(queueService.getQueueStats());
    setCapacitySummary(warehouseService.getCapacitySummary());
  };

  // Mock stats for pending approvals and rejected
  const mockStats = {
    pendingApproval: 24,
    approved: 156,
    rejected: 7
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Commercial Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending Approval
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {mockStats.pendingApproval}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/commercial/products" className="font-medium text-blue-600 hover:text-blue-500">
                View products
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    In Capacity Queue
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {queueStats.total}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/commercial/queue" className="font-medium text-blue-600 hover:text-blue-500">
                Manage queue
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
                    Approved (30 days)
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {mockStats.approved}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/commercial/reports" className="font-medium text-blue-600 hover:text-blue-500">
                View reports
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircle className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Rejected (30 days)
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {mockStats.rejected}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/commercial/reports" className="font-medium text-blue-600 hover:text-blue-500">
                View reports
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Activity Audit Log */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <AuditLog showGlobal={true} />
        </div>
      </div>
    </div>
  );
};