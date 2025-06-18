export interface SKUEntry {
  id: string;
  name: string;
  responsibleUser: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface SupplierEntry {
  id: string;
  supplier: string;
  skuCount: number;
  date: string;
  changeDate: string;
  hasHints: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  odpovědnyUzivatel: string;
  skus?: SKUEntry[];
}

export interface SupplierFilters {
  supplierName: string;
  hideProcessed: boolean;
  odpovědnyUzivatel: string;
  dateFrom: string;
  dateTo: string;
} 