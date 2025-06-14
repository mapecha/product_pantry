import React, { useState, useEffect } from 'react';
import { Clock, User, FileText, ArrowRight } from 'lucide-react';
import { auditService } from '../../services/auditService';
import { AuditLogEntry, WorkflowState } from '../../types/Workflow';

interface AuditLogProps {
  productId?: string;
  showGlobal?: boolean;
}

export const AuditLog: React.FC<AuditLogProps> = ({ productId, showGlobal = false }) => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadLogs();
  }, [productId, showGlobal, page]);

  const loadLogs = () => {
    if (showGlobal) {
      const result = auditService.getAllLogs(page, 20);
      setLogs(result.logs);
      setTotalPages(Math.ceil(result.total / result.pageSize));
    } else if (productId) {
      const productLogs = auditService.getProductLogs(productId);
      setLogs(productLogs);
      setTotalPages(1);
    }
  };

  const getStateColor = (state?: WorkflowState): string => {
    if (!state) return 'gray';
    
    const colors: Record<WorkflowState, string> = {
      [WorkflowState.PENDING_APPROVAL]: 'gray',
      [WorkflowState.COMMERCIAL_APPROVED]: 'blue',
      [WorkflowState.WAITING_FOR_CAPACITY]: 'yellow',
      [WorkflowState.ASSIGN_WAREHOUSE_POSITION]: 'orange',
      [WorkflowState.WAITING_FOR_ORDER]: 'purple',
      [WorkflowState.ACTIVE]: 'green',
      [WorkflowState.CANCELLED]: 'red'
    };
    
    return colors[state] || 'gray';
  };

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionIcon = (action: string) => {
    if (action.includes('State')) return <ArrowRight className="w-4 h-4" />;
    if (action.includes('Queue')) return <FileText className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No audit logs available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {showGlobal ? 'Global Audit Log' : 'Product History'}
      </h3>

      <div className="flow-root">
        <ul className="-mb-8">
          {logs.map((log, logIdx) => (
            <li key={log.id}>
              <div className="relative pb-8">
                {logIdx !== logs.length - 1 && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3">
                  <div>
                    <span className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white">
                      {getActionIcon(log.action)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div>
                      <div className="text-sm text-gray-500">
                        <span className="font-medium text-gray-900">{log.user}</span>
                        {' · '}
                        <span className="text-xs">{log.userRole.replace('_', ' ')}</span>
                        {' · '}
                        <time dateTime={log.timestamp}>
                          {formatTimestamp(log.timestamp)}
                        </time>
                      </div>
                      <p className="mt-1 text-sm text-gray-900">{log.action}</p>
                    </div>
                    
                    {log.fromState && log.toState && (
                      <div className="mt-2 flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-${getStateColor(log.fromState)}-100 text-${getStateColor(log.fromState)}-800`}>
                          {log.fromState.replace('_', ' ')}
                        </span>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-${getStateColor(log.toState)}-100 text-${getStateColor(log.toState)}-800`}>
                          {log.toState.replace('_', ' ')}
                        </span>
                      </div>
                    )}
                    
                    {log.details && (
                      <p className="mt-1 text-sm text-gray-600">{log.details}</p>
                    )}
                    
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className="mt-2 text-xs text-gray-500">
                        {Object.entries(log.metadata).map(([key, value]) => (
                          <span key={key} className="mr-3">
                            {key}: {JSON.stringify(value)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {showGlobal && totalPages > 1 && (
        <div className="mt-4 flex justify-center space-x-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-sm">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};