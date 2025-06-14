import { WorkflowState } from '../types/Workflow';

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  totalCapacity: number;
  usedCapacity: number;
  availableCapacity: number;
}

export interface CapacityCheckResult {
  warehouseId: string;
  warehouseName: string;
  hasCapacity: boolean;
  availableSlots: number;
  nextCheckTime: Date;
}

// Mock warehouse data
const MOCK_WAREHOUSES: Warehouse[] = [
  {
    id: 'wh-prague-1',
    name: 'Prague Central',
    location: 'Prague',
    totalCapacity: 1000,
    usedCapacity: 850,
    availableCapacity: 150
  },
  {
    id: 'wh-brno-1',
    name: 'Brno Distribution',
    location: 'Brno',
    totalCapacity: 800,
    usedCapacity: 750,
    availableCapacity: 50
  },
  {
    id: 'wh-ostrava-1',
    name: 'Ostrava Hub',
    location: 'Ostrava',
    totalCapacity: 600,
    usedCapacity: 580,
    availableCapacity: 20
  }
];

class WarehouseService {
  private checkInterval: number = 30000; // 30 seconds for demo
  private capacityCheckCallbacks: ((results: CapacityCheckResult[]) => void)[] = [];

  // Get all warehouses
  getWarehouses(): Warehouse[] {
    return MOCK_WAREHOUSES;
  }

  // Check capacity for all warehouses
  async checkCapacity(): Promise<CapacityCheckResult[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Randomly adjust capacity to simulate real-world changes
    const results: CapacityCheckResult[] = MOCK_WAREHOUSES.map(warehouse => {
      // Random capacity fluctuation
      const randomChange = Math.floor(Math.random() * 10) - 5;
      const currentAvailable = Math.max(0, warehouse.availableCapacity + randomChange);
      
      // Update mock data
      warehouse.availableCapacity = currentAvailable;
      warehouse.usedCapacity = warehouse.totalCapacity - currentAvailable;

      return {
        warehouseId: warehouse.id,
        warehouseName: warehouse.name,
        hasCapacity: currentAvailable > 0,
        availableSlots: currentAvailable,
        nextCheckTime: new Date(Date.now() + this.checkInterval)
      };
    });

    return results;
  }

  // Allocate capacity for a product
  async allocateCapacity(warehouseId: string, productId: string, slots: number = 1): Promise<boolean> {
    const warehouse = MOCK_WAREHOUSES.find(w => w.id === warehouseId);
    if (!warehouse || warehouse.availableCapacity < slots) {
      return false;
    }

    warehouse.availableCapacity -= slots;
    warehouse.usedCapacity += slots;
    return true;
  }

  // Release capacity (for cancellations)
  async releaseCapacity(warehouseId: string, slots: number = 1): Promise<void> {
    const warehouse = MOCK_WAREHOUSES.find(w => w.id === warehouseId);
    if (warehouse) {
      warehouse.availableCapacity += slots;
      warehouse.usedCapacity -= slots;
    }
  }

  // Start automated capacity checking
  startAutomatedChecking(callback: (results: CapacityCheckResult[]) => void): () => void {
    this.capacityCheckCallbacks.push(callback);
    
    // Initial check
    this.checkCapacity().then(results => {
      this.capacityCheckCallbacks.forEach(cb => cb(results));
    });

    // Set up interval
    const intervalId = setInterval(async () => {
      const results = await this.checkCapacity();
      this.capacityCheckCallbacks.forEach(cb => cb(results));
    }, this.checkInterval);

    // Return cleanup function
    return () => {
      clearInterval(intervalId);
      this.capacityCheckCallbacks = this.capacityCheckCallbacks.filter(cb => cb !== callback);
    };
  }

  // Get capacity summary
  getCapacitySummary(): { total: number; used: number; available: number } {
    return MOCK_WAREHOUSES.reduce((acc, warehouse) => ({
      total: acc.total + warehouse.totalCapacity,
      used: acc.used + warehouse.usedCapacity,
      available: acc.available + warehouse.availableCapacity
    }), { total: 0, used: 0, available: 0 });
  }
}

export const warehouseService = new WarehouseService();