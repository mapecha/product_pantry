export interface SupplierEntry {
  id: string;
  supplier: string;
  skuCount: number;
  date: string;
  changeDate: string;
  hasHints: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  odpovědnyUzivatel: string;
}

export interface SupplierFilters {
  supplierName: string;
  hideProcessed: boolean;
  odpovědnyUzivatel: string;
  dateFrom: string;
  dateTo: string;
} 