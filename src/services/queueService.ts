import { WorkflowState, UserRole } from '../types/Workflow';
import { warehouseService, CapacityCheckResult } from './warehouseService';
import { auditService } from './auditService';

export interface QueueProduct {
  id: string;
  productId: string;
  productName: string;
  supplier: string;
  skuCount: number;
  workflowState: WorkflowState;
  queuePosition: number;
  approvedAt: string;
  approvedBy: string;
  lockedForReordering: boolean;
  assignedWarehouseId?: string;
  metadata?: Record<string, any>;
}

class QueueService {
  private queue: QueueProduct[] = [];
  private progressionCallbacks: ((product: QueueProduct) => void)[] = [];

  constructor() {
    // Load queue from sessionStorage on init
    this.loadQueue();
    
    // Start automated capacity checking
    warehouseService.startAutomatedChecking(this.handleCapacityCheck.bind(this));
  }

  // Load queue from storage
  private loadQueue(): void {
    const stored = sessionStorage.getItem('workflowQueue');
    if (stored) {
      this.queue = JSON.parse(stored);
    }
  }

  // Save queue to storage
  private saveQueue(): void {
    sessionStorage.setItem('workflowQueue', JSON.stringify(this.queue));
  }

  // Add product to queue
  addToQueue(product: {
    productId: string;
    productName: string;
    supplier: string;
    approvedBy: string;
  }): QueueProduct {
    const queueProduct: QueueProduct = {
      id: `queue-${product.productId}`,
      productId: product.productId,
      productName: product.productName,
      supplier: product.supplier,
      skuCount: 1,
      workflowState: WorkflowState.WAITING_FOR_CAPACITY,
      queuePosition: this.queue.length + 1,
      approvedAt: new Date().toISOString(),
      approvedBy: product.approvedBy,
      lockedForReordering: false
    };

    this.queue.push(queueProduct);
    this.saveQueue();

    // Log the action
    auditService.logStateTransition(
      product.productId,
      product.approvedBy,
      UserRole.COMMERCIAL,
      WorkflowState.PENDING_APPROVAL,
      WorkflowState.WAITING_FOR_CAPACITY,
      'Product approved and added to capacity queue'
    );

    return queueProduct;
  }

  // Get current queue
  getQueue(): QueueProduct[] {
    return [...this.queue];
  }

  // Reorder queue
  reorderQueue(productId: string, newPosition: number, user: string): boolean {
    const productIndex = this.queue.findIndex(p => p.id === productId);
    if (productIndex === -1) return false;

    const product = this.queue[productIndex];
    
    // Check if product is locked
    if (product.lockedForReordering) {
      console.warn('Cannot reorder locked product');
      return false;
    }

    // Remove from current position
    this.queue.splice(productIndex, 1);
    
    // Insert at new position
    this.queue.splice(newPosition - 1, 0, product);
    
    // Update positions
    this.queue.forEach((p, index) => {
      p.queuePosition = index + 1;
    });

    this.saveQueue();

    // Log the action
    auditService.logQueueAction(
      product.productId,
      user,
      UserRole.COMMERCIAL,
      'reorder',
      {
        fromPosition: productIndex + 1,
        toPosition: newPosition
      }
    );

    return true;
  }

  // Remove from queue
  removeFromQueue(productId: string, user: string, reason?: string): boolean {
    const productIndex = this.queue.findIndex(p => p.id === productId);
    if (productIndex === -1) return false;

    const product = this.queue[productIndex];
    
    // Check if product is locked
    if (product.lockedForReordering) {
      console.warn('Cannot remove locked product');
      return false;
    }

    // Remove product
    this.queue.splice(productIndex, 1);
    
    // Update positions
    this.queue.forEach((p, index) => {
      p.queuePosition = index + 1;
    });

    this.saveQueue();

    // Log the action
    auditService.logQueueAction(
      product.productId,
      user,
      UserRole.COMMERCIAL,
      'remove',
      { reason }
    );

    return true;
  }

  // Handle capacity check results
  private handleCapacityCheck(results: CapacityCheckResult[]): void {
    console.log('[CAPACITY CHECK]', results);

    // Find warehouses with capacity
    const availableWarehouses = results.filter(r => r.hasCapacity);
    
    if (availableWarehouses.length === 0) {
      console.log('No warehouse capacity available');
      return;
    }

    // Process queue in order
    const queueToProcess = this.queue
      .filter(p => p.workflowState === WorkflowState.WAITING_FOR_CAPACITY && !p.lockedForReordering)
      .sort((a, b) => a.queuePosition - b.queuePosition);

    for (const product of queueToProcess) {
      // Find best warehouse (most capacity)
      const bestWarehouse = availableWarehouses
        .sort((a, b) => b.availableSlots - a.availableSlots)[0];

      if (bestWarehouse && bestWarehouse.availableSlots > 0) {
        // Attempt to allocate capacity
        this.progressProduct(product, bestWarehouse.warehouseId, 'system');
        
        // Reduce available slots for next iteration
        bestWarehouse.availableSlots--;
        
        // Stop if no more capacity
        if (availableWarehouses.every(w => w.availableSlots <= 0)) {
          break;
        }
      }
    }
  }

  // Progress product to next state
  async progressProduct(product: QueueProduct, warehouseId: string, user: string): Promise<boolean> {
    // Allocate warehouse capacity
    const allocated = await warehouseService.allocateCapacity(warehouseId, product.productId);
    
    if (!allocated) {
      console.error('Failed to allocate warehouse capacity');
      return false;
    }

    // Update product state
    product.workflowState = WorkflowState.ASSIGN_WAREHOUSE_POSITION;
    product.assignedWarehouseId = warehouseId;
    product.lockedForReordering = true;

    // Get warehouse name
    const warehouses = warehouseService.getWarehouses();
    const warehouse = warehouses.find(w => w.id === warehouseId);
    const warehouseName = warehouse?.name || 'Unknown Warehouse';

    // Add to warehouse assignment service
    const { warehouseAssignmentService } = await import('./warehouseAssignmentService');
    warehouseAssignmentService.addPendingAssignment({
      productId: product.productId,
      productName: product.productName,
      supplier: product.supplier,
      queuePosition: product.queuePosition,
      assignedWarehouseId: warehouseId,
      warehouseName,
      estimatedSize: 1
    });

    // Remove from queue (it's now in warehouse assignment phase)
    const index = this.queue.findIndex(p => p.id === product.id);
    if (index !== -1) {
      this.queue.splice(index, 1);
    }

    // Update queue positions
    this.queue.forEach((p, index) => {
      p.queuePosition = index + 1;
    });

    this.saveQueue();

    // Log the transition
    auditService.logStateTransition(
      product.productId,
      user,
      user === 'system' ? UserRole.COMMERCIAL : UserRole.COMMERCIAL,
      WorkflowState.WAITING_FOR_CAPACITY,
      WorkflowState.ASSIGN_WAREHOUSE_POSITION,
      `Capacity allocated in warehouse ${warehouseName}`
    );

    // Notify callbacks
    this.progressionCallbacks.forEach(cb => cb(product));

    return true;
  }

  // Subscribe to progression events
  onProgression(callback: (product: QueueProduct) => void): () => void {
    this.progressionCallbacks.push(callback);
    return () => {
      this.progressionCallbacks = this.progressionCallbacks.filter(cb => cb !== callback);
    };
  }

  // Get queue statistics
  getQueueStats(): {
    total: number;
    waiting: number;
    locked: number;
    avgWaitTime: number;
  } {
    const waiting = this.queue.filter(p => p.workflowState === WorkflowState.WAITING_FOR_CAPACITY);
    const locked = this.queue.filter(p => p.lockedForReordering);
    
    // Calculate average wait time
    const now = new Date().getTime();
    const waitTimes = waiting.map(p => now - new Date(p.approvedAt).getTime());
    const avgWaitTime = waitTimes.length > 0 
      ? waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length 
      : 0;

    return {
      total: this.queue.length,
      waiting: waiting.length,
      locked: locked.length,
      avgWaitTime: Math.floor(avgWaitTime / 1000 / 60) // in minutes
    };
  }
}

export const queueService = new QueueService();