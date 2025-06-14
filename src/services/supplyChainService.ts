import { TaskType, SupplyChainTask, WorkflowState } from '../types/Workflow';
import { auditService } from './auditService';

interface ProductWithTasks {
  id: string;
  productName: string;
  supplier: string;
  state: WorkflowState;
  tasks: SupplyChainTask[];
  assignedWarehouse?: string;
  warehousePosition?: string;
  receivedAt: string;
}

interface EDIConnection {
  id: string;
  supplierName: string;
  connectionType: 'ORDERS' | 'INVOICES' | 'CONFIRMATIONS';
  status: 'connected' | 'pending' | 'error';
  lastSync?: string;
  endpoint?: string;
  credentials?: {
    username: string;
    password: string;
    testMode: boolean;
  };
}

interface FirstOrder {
  id: string;
  productId: string;
  productName: string;
  supplier: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  deliveryDate: string;
  status: 'draft' | 'sent' | 'confirmed' | 'delivered';
  orderNumber?: string;
  createdAt: string;
  createdBy: string;
}

class SupplyChainService {
  private products: ProductWithTasks[] = [];
  private ediConnections: EDIConnection[] = [];
  private orders: FirstOrder[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadFromStorage();
    this.subscribeToWorkflowChanges();
  }

  private loadFromStorage() {
    const stored = sessionStorage.getItem('supplyChainData');
    if (stored) {
      const data = JSON.parse(stored);
      this.products = data.products || [];
      this.ediConnections = data.ediConnections || [];
      this.orders = data.orders || [];
    }
  }

  private saveToStorage() {
    sessionStorage.setItem('supplyChainData', JSON.stringify({
      products: this.products,
      ediConnections: this.ediConnections,
      orders: this.orders
    }));
  }

  private subscribeToWorkflowChanges() {
    // Check for new products in WAITING_FOR_ORDER state every 5 seconds
    setInterval(() => {
      this.checkForNewProducts();
    }, 5000);
  }

  private checkForNewProducts() {
    const assignments = JSON.parse(sessionStorage.getItem('warehouseAssignments') || '[]');
    const existingProductIds = new Set(this.products.map(p => p.id));

    assignments.forEach((assignment: any) => {
      if (assignment.state === WorkflowState.WAITING_FOR_ORDER && !existingProductIds.has(assignment.productId)) {
        this.addProduct({
          id: assignment.productId,
          productName: assignment.productName,
          supplier: assignment.supplier || 'Unknown Supplier',
          state: WorkflowState.WAITING_FOR_ORDER,
          tasks: this.createInitialTasks(),
          assignedWarehouse: assignment.warehouseName,
          warehousePosition: assignment.position,
          receivedAt: new Date().toISOString()
        });
      }
    });
  }

  private createInitialTasks(): SupplyChainTask[] {
    return [
      {
        id: `edi-${Date.now()}`,
        type: TaskType.EDI_CONNECTION,
        status: 'pending'
      },
      {
        id: `order-${Date.now()}`,
        type: TaskType.FIRST_ORDER,
        status: 'pending'
      }
    ];
  }

  addProduct(product: ProductWithTasks) {
    this.products.push(product);
    this.saveToStorage();
    this.notifyListeners();

    auditService.log({
      user: 'system',
      userRole: 'supply_chain' as any,
      action: 'Product Added to Supply Chain',
      toState: WorkflowState.WAITING_FOR_ORDER,
      details: `Product ${product.productName} added to supply chain task queue`,
      metadata: { productId: product.id, supplier: product.supplier }
    });
  }

  getProductsWaitingForOrder(): ProductWithTasks[] {
    return this.products.filter(p => p.state === WorkflowState.WAITING_FOR_ORDER);
  }

  getProductTasksById(productId: string): SupplyChainTask[] {
    const product = this.products.find(p => p.id === productId);
    return product?.tasks || [];
  }

  completeTask(productId: string, taskId: string, user: string, notes?: string): boolean {
    const product = this.products.find(p => p.id === productId);
    if (!product) return false;

    const task = product.tasks.find(t => t.id === taskId);
    if (!task) return false;

    task.status = 'completed';
    task.completedBy = user;
    task.completedAt = new Date().toISOString();
    task.notes = notes;

    // Check if all tasks are completed
    const allTasksCompleted = product.tasks.every(t => t.status === 'completed');
    if (allTasksCompleted) {
      this.activateProduct(productId, user);
    }

    this.saveToStorage();
    this.notifyListeners();

    auditService.log({
      user,
      userRole: 'supply_chain' as any,
      action: 'Task Completed',
      details: `${task.type.replace('_', ' ')} task completed for ${product.productName}`,
      metadata: { 
        productId, 
        taskId, 
        taskType: task.type,
        allTasksCompleted 
      }
    });

    return true;
  }

  private activateProduct(productId: string, user: string) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    product.state = WorkflowState.ACTIVE;

    // Update in queue service as well
    const assignments = JSON.parse(sessionStorage.getItem('warehouseAssignments') || '[]');
    const assignment = assignments.find((a: any) => a.productId === productId);
    if (assignment) {
      assignment.state = WorkflowState.ACTIVE;
      sessionStorage.setItem('warehouseAssignments', JSON.stringify(assignments));
    }

    auditService.log({
      user,
      userRole: 'supply_chain' as any,
      action: 'Product Activated',
      fromState: WorkflowState.WAITING_FOR_ORDER,
      toState: WorkflowState.ACTIVE,
      details: `Product ${product.productName} activated - all supply chain tasks completed`,
      metadata: { productId }
    });
  }

  // EDI Connection Management
  getEDIConnections(): EDIConnection[] {
    return this.ediConnections;
  }

  createEDIConnection(connection: Omit<EDIConnection, 'id'>): boolean {
    const newConnection: EDIConnection = {
      ...connection,
      id: `edi-${Date.now()}`
    };

    this.ediConnections.push(newConnection);
    this.saveToStorage();
    this.notifyListeners();

    auditService.log({
      user: 'current-user',
      userRole: 'supply_chain' as any,
      action: 'EDI Connection Created',
      details: `EDI connection created for ${connection.supplierName} (${connection.connectionType})`,
      metadata: { 
        supplierId: connection.supplierName,
        connectionType: connection.connectionType 
      }
    });

    return true;
  }

  updateEDIConnectionStatus(connectionId: string, status: EDIConnection['status'], user: string): boolean {
    const connection = this.ediConnections.find(c => c.id === connectionId);
    if (!connection) return false;

    connection.status = status;
    if (status === 'connected') {
      connection.lastSync = new Date().toISOString();
    }

    this.saveToStorage();
    this.notifyListeners();

    auditService.log({
      user,
      userRole: 'supply_chain' as any,
      action: 'EDI Connection Updated',
      details: `EDI connection for ${connection.supplierName} status changed to ${status}`,
      metadata: { connectionId, status }
    });

    return true;
  }

  // Order Management
  getOrders(): FirstOrder[] {
    return this.orders;
  }

  createFirstOrder(order: Omit<FirstOrder, 'id' | 'createdAt' | 'status'>): boolean {
    const newOrder: FirstOrder = {
      ...order,
      id: `order-${Date.now()}`,
      status: 'draft',
      createdAt: new Date().toISOString()
    };

    this.orders.push(newOrder);
    this.saveToStorage();
    this.notifyListeners();

    auditService.log({
      user: order.createdBy,
      userRole: 'supply_chain' as any,
      action: 'First Order Created',
      details: `First order created for ${order.productName} - ${order.quantity} units`,
      metadata: { 
        productId: order.productId,
        quantity: order.quantity,
        totalAmount: order.totalAmount 
      }
    });

    return true;
  }

  updateOrderStatus(orderId: string, status: FirstOrder['status'], user: string, orderNumber?: string): boolean {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return false;

    order.status = status;
    if (orderNumber) {
      order.orderNumber = orderNumber;
    }

    this.saveToStorage();
    this.notifyListeners();

    auditService.log({
      user,
      userRole: 'supply_chain' as any,
      action: 'Order Status Updated',
      details: `Order for ${order.productName} status changed to ${status}`,
      metadata: { orderId, status, orderNumber }
    });

    return true;
  }

  // Stats and Analytics
  getSupplyChainStats() {
    const pendingTasks = this.products.reduce((count, product) => 
      count + product.tasks.filter(task => task.status === 'pending').length, 0
    );

    const today = new Date().toDateString();
    const completedToday = this.products.reduce((count, product) => 
      count + product.tasks.filter(task => 
        task.status === 'completed' && 
        task.completedAt && 
        new Date(task.completedAt).toDateString() === today
      ).length, 0
    );

    const readyProducts = this.products.filter(p => 
      p.tasks.every(t => t.status === 'completed')
    ).length;

    const ediConnections = this.ediConnections.filter(c => c.status === 'connected').length;
    const activeOrders = this.orders.filter(o => ['sent', 'confirmed'].includes(o.status)).length;

    return {
      pendingTasks,
      completedToday,
      avgTaskTime: 24, // Mock average time in hours
      readyProducts,
      ediConnections,
      activeOrders
    };
  }

  getRecentActivity() {
    const activities: Array<{
      id: string;
      type: string;
      productName: string;
      action: string;
      timestamp: string;
      status: 'completed' | 'pending' | 'error';
    }> = [];

    // Add task completions
    this.products.forEach(product => {
      product.tasks.forEach(task => {
        if (task.completedAt) {
          activities.push({
            id: `task-${task.id}`,
            type: 'task',
            productName: product.productName,
            action: `${task.type.replace('_', ' ')} completed`,
            timestamp: task.completedAt,
            status: 'completed'
          });
        }
      });
    });

    // Add recent orders
    this.orders.forEach(order => {
      activities.push({
        id: `order-${order.id}`,
        type: 'order',
        productName: order.productName,
        action: `Order ${order.status}`,
        timestamp: order.createdAt,
        status: order.status === 'confirmed' ? 'completed' : 'pending'
      });
    });

    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  }

  // Event subscription
  onTaskUpdate(callback: () => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }
}

export const supplyChainService = new SupplyChainService();