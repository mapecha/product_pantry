import React, { useState, useEffect } from 'react';
import { History, User, Calendar, Filter } from 'lucide-react';
import { skuService } from '../../services/skuService';
import { AuditLog } from '../../types/SKUManagement';

export const AuditHistory: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filterSKU, setFilterSKU] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [filterAction, setFilterAction] = useState('');

  useEffect(() => {
    loadLogs();
    const unsubscribe = skuService.subscribe(loadLogs);
    return unsubscribe;
  }, []);

  const loadLogs = () => {
    const allLogs = skuService.getAuditLogs();
    setLogs(allLogs.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionColor = (action: string) => {
    if (action.includes('Created')) return 'bg-green-100 text-green-800';
    if (action.includes('Cancelled')) return 'bg-red-100 text-red-800';
    if (action.includes('Progressed')) return 'bg-blue-100 text-blue-800';
    if (action.includes('Assigned')) return 'bg-purple-100 text-purple-800';
    if (action.includes('Backward')) return 'bg-orange-100 text-orange-800';
    return 'bg-gray-100 text-gray-800';
  };

  const filteredLogs = logs.filter(log => {
    if (filterSKU && !log.skuId.toLowerCase().includes(filterSKU.toLowerCase())) {
      return false;
    }
    if (filterUser && !log.user.toLowerCase().includes(filterUser.toLowerCase())) {
      return false;
    }
    if (filterAction && !log.action.toLowerCase().includes(filterAction.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Audit History</h2>
        <p className="mt-1 text-sm text-gray-600">
          Complete audit trail of all SKU management actions.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Filter by SKU
            </label>
            <input
              type="text"
              value={filterSKU}
              onChange={(e) => setFilterSKU(e.target.value)}
              placeholder="SKU ID..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Filter by User
            </label>
            <input
              type="text"
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              placeholder="User..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Filter by Action
            </label>
            <input
              type="text"
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              placeholder="Action..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div className="pt-5">
            <button
              onClick={() => {
                setFilterSKU('');
                setFilterUser('');
                setFilterAction('');
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Audit Logs ({filteredLogs.length})
          </h3>
        </div>
        
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <History className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p>No audit logs found</p>
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
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    State Change
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {formatDate(log.timestamp)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        {log.user}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                        {log.skuId}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.fromState && log.toState ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-xs">{log.fromState.replace('_', ' ')}</span>
                          <span>→</span>
                          <span className="text-xs font-medium">{log.toState.replace('_', ' ')}</span>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-xs truncate" title={log.details}>
                        {log.details || '-'}
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
  );
};