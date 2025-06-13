export interface SupplierEntry {
  id: string;
  supplier: string;
  skuCount: number;
  date: string;
  hasHints: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
}

export interface SupplierFilters {
  supplierName: string;
  hideProcessed: boolean;
} 