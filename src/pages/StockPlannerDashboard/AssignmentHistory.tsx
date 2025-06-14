import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, MapPin, Download, Filter, Search } from 'lucide-react';
import { auditService } from '../../services/auditService';
import { AuditLogEntry, UserRole, WorkflowState } from '../../types/Workflow';
import { AuditLog } from '../../components/shared/AuditLog';

export const AssignmentHistory: React.FC = () => {
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
    // Get all logs and filter for stock planner related actions
    const allLogs = auditService.getAllLogs(1, 1000).logs;
    const stockPlannerLogs = allLogs.filter(log => 
      log.userRole === UserRole.STOCK_PLANNER || 
      log.action.includes('Position') ||
      log.action.includes('Assignment') ||
      log.toState === WorkflowState.WAITING_FOR_ORDER
    );
    setLogs(stockPlannerLogs);
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
          case 'assignments':
            return log.action.includes('Position') || log.action.includes('Assignment');
          case 'transitions':
            return log.action === 'State Transition';
          case 'manual':
            return log.action.includes('Manual');
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
    a.download = `assignment_history_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getActionStats = () => {
    const stats = filteredLogs.reduce((acc, log) => {
      if (log.action.includes('Position') || log.action.includes('Assignment')) {
        acc.assignments += 1;
      } else if (log.action === 'State Transition') {
        acc.transitions += 1;
      } else if (log.action.includes('Manual')) {
        acc.manualActions += 1;
      }
      return acc;
    }, { assignments: 0, transitions: 0, manualActions: 0 });

    return stats;
  };

  const stats = getActionStats();
  const uniqueUsers = Array.from(new Set(logs.map(log => log.user))).sort();

  return (
    <div>
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assignment History</h1>
          <p className="mt-1 text-sm text-gray-600">
            View and analyze warehouse assignment history and audit logs.
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <MapPin className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Position Assignments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.assignments}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Clock className="h-6 w-6 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">State Transitions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.transitions}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <User className="h-6 w-6 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Manual Actions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.manualActions}</p>
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
              <option value="assignments">Position Assignments</option>
              <option value="transitions">State Transitions</option>
              <option value="manual">Manual Actions</option>
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

      {/* Assignment History Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Assignment History</h3>
        </div>
        
        <div className="overflow-hidden">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No History Found</h3>
              <p>No assignment history matches your current filters.</p>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.action}
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