import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Package, Download, Filter, Search } from 'lucide-react';
import { auditService } from '../../services/auditService';
import { AuditLogEntry, UserRole, WorkflowState } from '../../types/Workflow';

export const SupplyChainHistory: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>([]);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
    end: new Date().toISOString().split('T')[0] // today
  });
  const [filterUser, setFilterUser] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, dateRange, filterUser, filterAction, searchTerm]);

  const loadLogs = () => {
    // Get all logs and filter for supply chain related actions
    const allLogs = auditService.getAllLogs(1, 1000).logs;
    const supplyChainLogs = allLogs.filter(log => 
      log.userRole === UserRole.SUPPLY_CHAIN || 
      log.action.includes('Task') ||
      log.action.includes('EDI') ||
      log.action.includes('Order') ||
      log.action.includes('Product Activated') ||
      log.toState === WorkflowState.ACTIVE
    );
    setLogs(supplyChainLogs);
  };

  const applyFilters = () => {
    let filtered = [...logs];

    // Date range filter
    if (dateRange.start) {
      filtered = filtered.filter(log => log.timestamp >= dateRange.start);
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(log => log.timestamp <= endDate.toISOString());
    }

    // User filter
    if (filterUser) {
      filtered = filtered.filter(log => 
        log.user.toLowerCase().includes(filterUser.toLowerCase())
      );
    }

    // Action filter
    if (filterAction !== 'all') {
      filtered = filtered.filter(log => {
        switch (filterAction) {
          case 'tasks':
            return log.action.includes('Task');
          case 'edi':
            return log.action.includes('EDI');
          case 'orders':
            return log.action.includes('Order');
          case 'activations':
            return log.action.includes('Product Activated');
          default:
            return true;
        }
      });
    }

    // Search term
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.metadata?.productId && log.metadata.productId.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredLogs(filtered);
  };

  const exportLogs = () => {
    const csv = auditService.exportLogs('csv');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `supply_chain_history_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getActionStats = () => {
    const stats = filteredLogs.reduce((acc, log) => {
      if (log.action.includes('Task')) {
        acc.tasks += 1;
      } else if (log.action.includes('EDI')) {
        acc.edi += 1;
      } else if (log.action.includes('Order')) {
        acc.orders += 1;
      } else if (log.action.includes('Product Activated')) {
        acc.activations += 1;
      }
      return acc;
    }, { tasks: 0, edi: 0, orders: 0, activations: 0 });

    return stats;
  };

  const stats = getActionStats();
  const uniqueUsers = Array.from(new Set(logs.map(log => log.user))).sort();

  return (
    <div>
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Supply Chain History</h1>
          <p className="mt-1 text-sm text-gray-600">
            View and analyze supply chain task history and audit logs.
          </p>
        </div>
        
        <button
          onClick={exportLogs}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Clock className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Task Actions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.tasks}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Package className="h-6 w-6 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">EDI Operations</p>
              <p className="text-2xl font-bold text-gray-900">{stats.edi}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Package className="h-6 w-6 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.orders}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Package className="h-6 w-6 text-orange-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Activations</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activations}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User
            </label>
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Users</option>
              {uniqueUsers.map(user => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action Type
            </label>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Actions</option>
              <option value="tasks">Task Actions</option>
              <option value="edi">EDI Operations</option>
              <option value="orders">Order Management</option>
              <option value="activations">Product Activations</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search actions, details, or product IDs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredLogs.length} of {logs.length} log entries
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Supply Chain History</h3>
        </div>
        
        <div className="overflow-hidden">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No History Found</h3>
              <p>No supply chain history matches your current filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(log.timestamp).toLocaleString('cs-CZ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{log.user}</div>
                            <div className="text-sm text-gray-500">{log.userRole.replace('_', ' ')}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          log.action.includes('Task') ? 'bg-blue-100 text-blue-800' :
                          log.action.includes('EDI') ? 'bg-green-100 text-green-800' :
                          log.action.includes('Order') ? 'bg-purple-100 text-purple-800' :
                          log.action.includes('Activated') ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.metadata?.productId || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs truncate" title={log.details}>
                          {log.details || '-'}
                        </div>
                        {log.fromState && log.toState && (
                          <div className="mt-1 text-xs text-gray-500">
                            {log.fromState.replace('_', ' ')} → {log.toState.replace('_', ' ')}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};