import { SKU, SKUState, AuditLog, CapacityCheck } from '../types/SKUManagement';

class SKUService {
  private skus: SKU[] = [];
  private auditLogs: AuditLog[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const storedSKUs = localStorage.getItem('sku_queue');
    const storedLogs = localStorage.getItem('sku_audit_logs');
    
    if (storedSKUs) {
      this.skus = JSON.parse(storedSKUs);
    }
    if (storedLogs) {
      this.auditLogs = JSON.parse(storedLogs);
    }
  }

  private saveToStorage() {
    localStorage.setItem('sku_queue', JSON.stringify(this.skus));
    localStorage.setItem('sku_audit_logs', JSON.stringify(this.auditLogs));
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  createSKU(productId: string, productName: string, supplier: string, approvedBy: string, warehousesToList?: string[]): SKU {
    const newSKU: SKU = {
      id: `SKU-${Date.now()}`,
      productId,
      productName,
      supplier,
      state: SKUState.WAITING_FOR_CAPACITY,
      queuePosition: this.getNextQueuePosition(),
      approvedAt: new Date().toISOString(),
      approvedBy,
      warehousesToList: warehousesToList || [],
      lastModified: new Date().toISOString(),
      lockedForReordering: false
    };

    this.skus.push(newSKU);
    const warehouseInfo = warehousesToList ? ` for warehouses: ${warehousesToList.join(', ')}` : '';
    this.addAuditLog(approvedBy, 'SKU Created', newSKU.id, undefined, SKUState.WAITING_FOR_CAPACITY, `Product ${productName} approved and added to capacity queue${warehouseInfo}`);
    this.saveToStorage();
    this.notifyListeners();

    return newSKU;
  }

  private getNextQueuePosition(): number {
    const waitingSkus = this.skus.filter(sku => sku.state === SKUState.WAITING_FOR_CAPACITY);
    return waitingSkus.length + 1;
  }

  getSKUs(state?: SKUState): SKU[] {
    if (state) {
      return this.skus.filter(sku => sku.state === state);
    }
    return this.skus;
  }

  getSKUById(id: string): SKU | undefined {
    return this.skus.find(sku => sku.id === id);
  }

  reorderQueue(skuId: string, newPosition: number, performedBy: string): boolean {
    const sku = this.skus.find(s => s.id === skuId);
    if (!sku || sku.state !== SKUState.WAITING_FOR_CAPACITY || sku.lockedForReordering) {
      return false;
    }

    const oldPosition = sku.queuePosition || 0;
    const waitingSkus = this.skus.filter(s => s.state === SKUState.WAITING_FOR_CAPACITY);
    
    // Reorder logic
    waitingSkus.forEach(s => {
      if (s.queuePosition !== undefined) {
        if (s.id === skuId) {
          s.queuePosition = newPosition;
        } else if (oldPosition < newPosition && s.queuePosition > oldPosition && s.queuePosition <= newPosition) {
          s.queuePosition--;
        } else if (oldPosition > newPosition && s.queuePosition < oldPosition && s.queuePosition >= newPosition) {
          s.queuePosition++;
        }
      }
    });

    this.addAuditLog(performedBy, 'Queue Reordered', skuId, undefined, undefined, `SKU moved from position ${oldPosition} to ${newPosition}`);
    this.saveToStorage();
    this.notifyListeners();
    return true;
  }

  cancelSKU(skuId: string, performedBy: string, reason: string): boolean {
    const sku = this.skus.find(s => s.id === skuId);
    if (!sku || sku.state !== SKUState.WAITING_FOR_CAPACITY) {
      return false;
    }

    const oldState = sku.state;
    sku.state = SKUState.CANCELLED;
    sku.lastModified = new Date().toISOString();
    
    // Reorganize queue positions
    this.reorganizeQueue();
    
    this.addAuditLog(performedBy, 'SKU Cancelled', skuId, oldState, SKUState.CANCELLED, reason);
    this.saveToStorage();
    this.notifyListeners();
    return true;
  }

  progressToWarehouseAssignment(skuId: string, warehouseId: string, warehouseName: string): boolean {
    const sku = this.skus.find(s => s.id === skuId);
    if (!sku || sku.state !== SKUState.WAITING_FOR_CAPACITY) {
      return false;
    }

    const oldState = sku.state;
    sku.state = SKUState.ASSIGN_WAREHOUSE_POSITION;
    sku.warehouse = {
      id: warehouseId,
      name: warehouseName
    };
    sku.lockedForReordering = true;
    sku.lastModified = new Date().toISOString();
    
    this.addAuditLog('system', 'Progressed to Warehouse Assignment', skuId, oldState, SKUState.ASSIGN_WAREHOUSE_POSITION, `Capacity available at ${warehouseName}`);
    this.saveToStorage();
    this.notifyListeners();
    return true;
  }

  assignWarehousePosition(skuId: string, position: string, assignedBy: string): boolean {
    const sku = this.skus.find(s => s.id === skuId);
    if (!sku || sku.state !== SKUState.ASSIGN_WAREHOUSE_POSITION || !sku.warehouse) {
      return false;
    }

    const oldState = sku.state;
    sku.state = SKUState.WAITING_FOR_ORDER;
    sku.warehouse.position = position;
    sku.warehouse.assignedAt = new Date().toISOString();
    sku.warehouse.assignedBy = assignedBy;
    sku.lastModified = new Date().toISOString();
    
    this.addAuditLog(assignedBy, 'Warehouse Position Assigned', skuId, oldState, SKUState.WAITING_FOR_ORDER, `Position ${position} assigned in ${sku.warehouse.name}`);
    this.saveToStorage();
    this.notifyListeners();
    return true;
  }

  moveBackward(skuId: string, performedBy: string, reason: string): boolean {
    const sku = this.skus.find(s => s.id === skuId);
    if (!sku) return false;

    let oldState = sku.state;
    let newState: SKUState | undefined;
    let details = '';

    switch (sku.state) {
      case SKUState.ASSIGN_WAREHOUSE_POSITION:
        newState = SKUState.WAITING_FOR_CAPACITY;
        sku.warehouse = undefined;
        sku.lockedForReordering = false;
        sku.queuePosition = this.getNextQueuePosition();
        details = 'Moved back to capacity queue';
        break;
      case SKUState.WAITING_FOR_ORDER:
        newState = SKUState.ASSIGN_WAREHOUSE_POSITION;
        if (sku.warehouse) {
          sku.warehouse.position = undefined;
          sku.warehouse.assignedAt = undefined;
          sku.warehouse.assignedBy = undefined;
        }
        details = 'Moved back to warehouse assignment';
        break;
      default:
        return false;
    }

    if (newState) {
      sku.state = newState;
      sku.lastModified = new Date().toISOString();
      this.addAuditLog(performedBy, 'Moved Backward', skuId, oldState, newState, `${details}. Reason: ${reason}`);
      this.saveToStorage();
      this.notifyListeners();
      return true;
    }

    return false;
  }

  private reorganizeQueue() {
    const waitingSkus = this.skus
      .filter(sku => sku.state === SKUState.WAITING_FOR_CAPACITY)
      .sort((a, b) => (a.queuePosition || 0) - (b.queuePosition || 0));
    
    waitingSkus.forEach((sku, index) => {
      sku.queuePosition = index + 1;
    });
  }

  private addAuditLog(user: string, action: string, skuId: string, fromState?: SKUState, toState?: SKUState, details?: string) {
    const log: AuditLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user,
      action,
      skuId,
      fromState,
      toState,
      details
    };
    this.auditLogs.push(log);
  }

  getAuditLogs(skuId?: string): AuditLog[] {
    if (skuId) {
      return this.auditLogs.filter(log => log.skuId === skuId);
    }
    return this.auditLogs;
  }
}

export const skuService = new SKUService();