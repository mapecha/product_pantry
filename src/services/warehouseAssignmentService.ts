import { WorkflowState, UserRole, WarehouseAssignment } from '../types/Workflow';
import { warehouseService } from './warehouseService';
import { auditService } from './auditService';

export interface PendingAssignment {
  id: string;
  productId: string;
  productName: string;
  supplier: string;
  queuePosition: number;
  assignedWarehouseId: string;
  warehouseName: string;
  priority: 'high' | 'medium' | 'low';
  receivedAt: string;
  estimatedSize: number;
  notes?: string;
}

export interface WarehousePosition {
  id: string;
  warehouseId: string;
  section: string;
  aisle: string;
  shelf: string;
  position: string;
  capacity: number;
  occupied: boolean;
  productId?: string;
}

class WarehouseAssignmentService {
  private pendingAssignments: PendingAssignment[] = [];
  private warehousePositions: Map<string, WarehousePosition[]> = new Map();
  private assignments: Map<string, WarehouseAssignment> = new Map();
  private assignmentCallbacks: ((assignment: WarehouseAssignment) => void)[] = [];

  constructor() {
    this.initializeMockData();
    this.loadFromStorage();
  }

  private initializeMockData(): void {
    // Initialize warehouse positions for each warehouse
    const warehouses = warehouseService.getWarehouses();
    
    warehouses.forEach(warehouse => {
      const positions: WarehousePosition[] = [];
      
      // Generate mock positions
      ['A', 'B', 'C'].forEach(section => {
        for (let aisle = 1; aisle <= 10; aisle++) {
          for (let shelf = 1; shelf <= 5; shelf++) {
            for (let pos = 1; pos <= 4; pos++) {
              positions.push({
                id: `${warehouse.id}-${section}${aisle}-${shelf}-${pos}`,
                warehouseId: warehouse.id,
                section,
                aisle: aisle.toString().padStart(2, '0'),
                shelf: shelf.toString(),
                position: pos.toString(),
                capacity: 1,
                occupied: Math.random() < 0.3, // 30% occupied
                productId: Math.random() < 0.3 ? `product-${Math.floor(Math.random() * 1000)}` : undefined
              });
            }
          }
        }
      });
      
      this.warehousePositions.set(warehouse.id, positions);
    });
  }

  private loadFromStorage(): void {
    const stored = sessionStorage.getItem('pendingAssignments');
    if (stored) {
      this.pendingAssignments = JSON.parse(stored);
    }
  }

  private saveToStorage(): void {
    sessionStorage.setItem('pendingAssignments', JSON.stringify(this.pendingAssignments));
  }

  // Add product for warehouse assignment
  addPendingAssignment(assignment: Omit<PendingAssignment, 'id' | 'receivedAt' | 'priority'>): PendingAssignment {
    const newAssignment: PendingAssignment = {
      ...assignment,
      id: `assignment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      receivedAt: new Date().toISOString(),
      priority: this.calculatePriority(assignment)
    };

    this.pendingAssignments.push(newAssignment);
    this.saveToStorage();

    // Log the action
    auditService.logStateTransition(
      assignment.productId,
      'system',
      UserRole.COMMERCIAL,
      WorkflowState.WAITING_FOR_CAPACITY,
      WorkflowState.ASSIGN_WAREHOUSE_POSITION,
      `Product assigned to warehouse ${assignment.warehouseName} for position assignment`
    );

    return newAssignment;
  }

  private calculatePriority(assignment: Omit<PendingAssignment, 'id' | 'receivedAt' | 'priority'>): 'high' | 'medium' | 'low' {
    // Priority logic: queue position, estimated size, supplier factors
    if (assignment.queuePosition <= 5) return 'high';
    if (assignment.queuePosition <= 15) return 'medium';
    return 'low';
  }

  // Get pending assignments
  getPendingAssignments(): PendingAssignment[] {
    return [...this.pendingAssignments].sort((a, b) => {
      // Sort by priority, then by queue position
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.queuePosition - b.queuePosition;
    });
  }

  // Get available positions in a warehouse
  getAvailablePositions(warehouseId: string): WarehousePosition[] {
    const positions = this.warehousePositions.get(warehouseId) || [];
    return positions.filter(pos => !pos.occupied);
  }

  // Get all positions in a warehouse
  getWarehousePositions(warehouseId: string): WarehousePosition[] {
    return this.warehousePositions.get(warehouseId) || [];
  }

  // Assign specific position to product
  async assignPosition(
    assignmentId: string,
    positionId: string,
    user: string,
    notes?: string
  ): Promise<boolean> {
    const assignment = this.pendingAssignments.find(a => a.id === assignmentId);
    if (!assignment) return false;

    const positions = this.warehousePositions.get(assignment.assignedWarehouseId);
    if (!positions) return false;

    const position = positions.find(p => p.id === positionId);
    if (!position || position.occupied) return false;

    // Mark position as occupied
    position.occupied = true;
    position.productId = assignment.productId;

    // Create warehouse assignment
    const warehouseAssignment: WarehouseAssignment = {
      warehouseId: assignment.assignedWarehouseId,
      warehouseName: assignment.warehouseName,
      position: `${position.section}${position.aisle}-${position.shelf}-${position.position}`,
      assignedBy: user,
      assignedAt: new Date().toISOString(),
      capacity: position.capacity
    };

    this.assignments.set(assignment.productId, warehouseAssignment);

    // Remove from pending assignments
    this.pendingAssignments = this.pendingAssignments.filter(a => a.id !== assignmentId);
    this.saveToStorage();

    // Log the assignment
    auditService.logStateTransition(
      assignment.productId,
      user,
      UserRole.STOCK_PLANNER,
      WorkflowState.ASSIGN_WAREHOUSE_POSITION,
      WorkflowState.WAITING_FOR_ORDER,
      `Assigned to position ${warehouseAssignment.position} in ${assignment.warehouseName}${notes ? ` - ${notes}` : ''}`
    );

    // Notify callbacks
    this.assignmentCallbacks.forEach(cb => cb(warehouseAssignment));

    return true;
  }

  // Manual workflow control - move assignment forward
  async moveForward(
    assignmentId: string,
    user: string,
    reason: string
  ): Promise<boolean> {
    const assignment = this.pendingAssignments.find(a => a.id === assignmentId);
    if (!assignment) return false;

    // Auto-assign to first available position
    const availablePositions = this.getAvailablePositions(assignment.assignedWarehouseId);
    if (availablePositions.length === 0) return false;

    const success = await this.assignPosition(
      assignmentId,
      availablePositions[0].id,
      user,
      `Auto-assigned (Forward): ${reason}`
    );

    if (success) {
      auditService.createLogEntry(
        assignment.productId,
        user,
        UserRole.STOCK_PLANNER,
        'Manual Forward',
        { details: reason }
      );
    }

    return success;
  }

  // Manual workflow control - move assignment backward
  async moveBackward(
    assignmentId: string,
    user: string,
    reason: string
  ): Promise<boolean> {
    const assignment = this.pendingAssignments.find(a => a.id === assignmentId);
    if (!assignment) return false;

    // Move back to capacity queue
    this.pendingAssignments = this.pendingAssignments.filter(a => a.id !== assignmentId);
    this.saveToStorage();

    // Release allocated warehouse capacity
    await warehouseService.releaseCapacity(assignment.assignedWarehouseId, 1);

    // Log the action
    auditService.logStateTransition(
      assignment.productId,
      user,
      UserRole.STOCK_PLANNER,
      WorkflowState.ASSIGN_WAREHOUSE_POSITION,
      WorkflowState.WAITING_FOR_CAPACITY,
      `Moved back to capacity queue: ${reason}`
    );

    return true;
  }

  // Get assignment by product ID
  getAssignment(productId: string): WarehouseAssignment | undefined {
    return this.assignments.get(productId);
  }

  // Get assignment statistics
  getAssignmentStats(): {
    pending: number;
    assigned: number;
    avgProcessingTime: number;
    byPriority: Record<string, number>;
    byWarehouse: Record<string, number>;
  } {
    const pending = this.pendingAssignments.length;
    const assigned = this.assignments.size;
    
    // Calculate average processing time
    const now = new Date().getTime();
    const processingTimes = this.pendingAssignments.map(a => 
      now - new Date(a.receivedAt).getTime()
    );
    const avgProcessingTime = processingTimes.length > 0 
      ? processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length / 1000 / 60 // in minutes
      : 0;

    // Group by priority
    const byPriority = this.pendingAssignments.reduce((acc, a) => {
      acc[a.priority] = (acc[a.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by warehouse
    const byWarehouse = this.pendingAssignments.reduce((acc, a) => {
      acc[a.warehouseName] = (acc[a.warehouseName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      pending,
      assigned,
      avgProcessingTime: Math.floor(avgProcessingTime),
      byPriority,
      byWarehouse
    };
  }

  // Subscribe to assignment events
  onAssignment(callback: (assignment: WarehouseAssignment) => void): () => void {
    this.assignmentCallbacks.push(callback);
    return () => {
      this.assignmentCallbacks = this.assignmentCallbacks.filter(cb => cb !== callback);
    };
  }
}

export const warehouseAssignmentService = new WarehouseAssignmentService();