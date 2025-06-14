// Workflow state definitions
export enum WorkflowState {
  PENDING_APPROVAL = 'pending_approval',
  COMMERCIAL_APPROVED = 'commercial_approved',
  WAITING_FOR_CAPACITY = 'waiting_for_capacity',
  ASSIGN_WAREHOUSE_POSITION = 'assign_warehouse_position',
  WAITING_FOR_ORDER = 'waiting_for_order',
  ACTIVE = 'active',
  CANCELLED = 'cancelled'
}

// User role definitions
export enum UserRole {
  COMMERCIAL = 'commercial',
  STOCK_PLANNER = 'stock_planner',
  SUPPLY_CHAIN = 'supply_chain',
  SUPPLIER = 'supplier'
}

// Warehouse assignment
export interface WarehouseAssignment {
  warehouseId: string;
  warehouseName: string;
  position: string;
  assignedBy: string;
  assignedAt: string;
  capacity: number;
}

// Supply chain task types
export enum TaskType {
  EDI_CONNECTION = 'edi_connection',
  FIRST_ORDER = 'first_order'
}

export interface SupplyChainTask {
  id: string;
  type: TaskType;
  status: 'pending' | 'in_progress' | 'completed';
  completedBy?: string;
  completedAt?: string;
  notes?: string;
}

// Audit log entry
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  userRole: UserRole;
  action: string;
  fromState?: WorkflowState;
  toState?: WorkflowState;
  details?: string;
  metadata?: Record<string, any>;
}

// Enhanced product with workflow
export interface WorkflowProduct {
  // All existing Product fields
  id: string;
  nazevProduktu: string;
  // ... other Product fields
  
  // Workflow specific fields
  workflowState: WorkflowState;
  queuePosition?: number;
  approvedAt?: string;
  approvedBy?: string;
  warehouseAssignments: WarehouseAssignment[];
  supplyChainTasks: SupplyChainTask[];
  auditLog: AuditLogEntry[];
  
  // Metadata
  lastModified: string;
  lockedForReordering?: boolean;
}