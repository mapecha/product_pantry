import { AuditLogEntry, UserRole, WorkflowState } from '../types/Workflow';

class AuditService {
  private auditLogs: Map<string, AuditLogEntry[]> = new Map();
  private globalLogs: AuditLogEntry[] = [];

  // Create audit log entry
  createLogEntry(
    productId: string,
    user: string,
    userRole: UserRole,
    action: string,
    details?: {
      fromState?: WorkflowState;
      toState?: WorkflowState;
      details?: string;
      metadata?: Record<string, any>;
    }
  ): AuditLogEntry {
    const logEntry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      user,
      userRole,
      action,
      ...details
    };

    // Add to product-specific logs
    if (!this.auditLogs.has(productId)) {
      this.auditLogs.set(productId, []);
    }
    this.auditLogs.get(productId)!.push(logEntry);

    // Add to global logs
    this.globalLogs.push({
      ...logEntry,
      metadata: { ...logEntry.metadata, productId }
    });

    // In a real app, this would be sent to a backend
    console.log('[AUDIT]', logEntry);

    return logEntry;
  }

  // Log state transition
  logStateTransition(
    productId: string,
    user: string,
    userRole: UserRole,
    fromState: WorkflowState,
    toState: WorkflowState,
    details?: string
  ): void {
    this.createLogEntry(
      productId,
      user,
      userRole,
      'State Transition',
      {
        fromState,
        toState,
        details
      }
    );
  }

  // Log queue action
  logQueueAction(
    productId: string,
    user: string,
    userRole: UserRole,
    action: 'reorder' | 'remove' | 'add',
    metadata?: Record<string, any>
  ): void {
    this.createLogEntry(
      productId,
      user,
      userRole,
      `Queue ${action}`,
      {
        metadata
      }
    );
  }

  // Get logs for a specific product
  getProductLogs(productId: string): AuditLogEntry[] {
    return this.auditLogs.get(productId) || [];
  }

  // Get all logs with pagination
  getAllLogs(page: number = 1, pageSize: number = 50): {
    logs: AuditLogEntry[];
    total: number;
    page: number;
    pageSize: number;
  } {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    return {
      logs: this.globalLogs.slice(start, end),
      total: this.globalLogs.length,
      page,
      pageSize
    };
  }

  // Get logs by user
  getUserLogs(user: string): AuditLogEntry[] {
    return this.globalLogs.filter(log => log.user === user);
  }

  // Get logs by action type
  getLogsByAction(action: string): AuditLogEntry[] {
    return this.globalLogs.filter(log => log.action.includes(action));
  }

  // Get logs within date range
  getLogsByDateRange(startDate: Date, endDate: Date): AuditLogEntry[] {
    return this.globalLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= startDate && logDate <= endDate;
    });
  }

  // Export logs (for reporting)
  exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(this.globalLogs, null, 2);
    }
    
    // CSV export
    const headers = ['Timestamp', 'User', 'Role', 'Action', 'From State', 'To State', 'Details'];
    const rows = this.globalLogs.map(log => [
      log.timestamp,
      log.user,
      log.userRole,
      log.action,
      log.fromState || '',
      log.toState || '',
      log.details || ''
    ]);
    
    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }
}

export const auditService = new AuditService();