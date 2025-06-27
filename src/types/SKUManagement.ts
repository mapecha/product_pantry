// SKU Management Types

export enum SKUState {
  WAITING_FOR_CAPACITY = 'waiting_for_capacity',
  ASSIGN_WAREHOUSE_POSITION = 'assign_warehouse_position',
  WAITING_FOR_ORDER = 'waiting_for_order',
  ACTIVE = 'active',
  CANCELLED = 'cancelled'
}

export interface SKU {
  id: string;
  productId: string;
  productName: string;
  supplier: string;
  state: SKUState;
  queuePosition?: number;
  approvedAt: string;
  approvedBy: string;
  warehousesToList?: string[]; // Warehouses selected for listing during approval
  remainingWarehouses?: string[]; // Warehouses still waiting for capacity
  warehouse?: {
    id: string;
    name: string;
    position?: string;
    assignedAt?: string;
    assignedBy?: string;
  };
  lastModified: string;
  lockedForReordering: boolean;
}

export interface CapacityCheck {
  warehouseId: string;
  warehouseName: string;
  availableCapacity: number;
  totalCapacity: number;
  lastChecked: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  skuId: string;
  fromState?: SKUState;
  toState?: SKUState;
  details?: string;
}

export interface QueueReorderEvent {
  skuId: string;
  oldPosition: number;
  newPosition: number;
  performedBy: string;
  timestamp: string;
}