import { SupplierEntry } from '../types/Supplier';

export const suppliers: SupplierEntry[] = [
  {
    id: 'nestle-cesko',
    supplier: 'Nestle Česko s.r.o.',
    skuCount: 1,
    date: '06/05/2025',
    changeDate: '2025-05-06',
    hasHints: false,
    status: 'pending',
    odpovědnyUzivatel: 'Martin Pecha',
    skus: [
      { id: 'SKU-NES-001', name: 'Nescafe Classic Instant Coffee 200g', responsibleUser: 'Martin Pecha', status: 'pending' }
    ]
  },
  {
    id: 'orbico',
    supplier: 'Orbico s.r.o.',
    skuCount: 1,
    date: '23/05/2025',
    changeDate: '2025-05-23',
    hasHints: false,
    status: 'pending',
    odpovědnyUzivatel: 'Jan Novák',
    skus: [
      { id: 'SKU-ORB-001', name: 'Palmolive Naturals Shower Gel 250ml', responsibleUser: 'Jan Novák', status: 'pending' }
    ]
  },
  {
    id: 'rewild',
    supplier: 'Rewild s.r.o.',
    skuCount: 3,
    date: '02/06/2025',
    changeDate: '2025-06-02',
    hasHints: false,
    status: 'pending',
    odpovědnyUzivatel: 'Petr Svoboda',
    skus: [
      { id: 'SKU-REW-001', name: 'Organic Honey 500g', responsibleUser: 'Petr Svoboda', status: 'pending' },
      { id: 'SKU-REW-002', name: 'Raw Almonds 250g', responsibleUser: 'Petr Svoboda', status: 'pending' },
      { id: 'SKU-REW-003', name: 'Chia Seeds 200g', responsibleUser: 'Petr Svoboda', status: 'pending' }
    ]
  },
  {
    id: 'mokate-czech',
    supplier: 'MOKATE Czech s.r.o.',
    skuCount: 2,
    date: '02/06/2025',
    changeDate: '2025-06-02',
    hasHints: false,
    status: 'pending',
    odpovědnyUzivatel: 'Martin Pecha',
    skus: [
      { id: 'SKU-MOK-001', name: 'Cappuccino Gold 3in1 Coffee 18g', responsibleUser: 'Martin Pecha', status: 'pending' },
      { id: 'SKU-MOK-002', name: 'Mokate Instant Coffee Classic 100g', responsibleUser: 'Martin Pecha', status: 'pending' }
    ]
  },
  {
    id: 'jacobs-douwe-egberts',
    supplier: 'JACOBS DOUWE EGBERTS CZ s.r.o.',
    skuCount: 2,
    date: '04/06/2025',
    changeDate: '2025-06-04',
    hasHints: true,
    status: 'pending',
    odpovědnyUzivatel: 'Anna Horáková',
    skus: [
      { id: 'SKU-JDE-001', name: 'Jacobs Kronung Ground Coffee 500g', responsibleUser: 'Anna Horáková', status: 'pending' },
      { id: 'SKU-JDE-002', name: 'Tassimo Coffee Pods - Latte Macchiato', responsibleUser: 'Anna Horáková', status: 'pending' }
    ]
  },
  {
    id: 'herbai',
    supplier: 'Herbai a.s.',
    skuCount: 8,
    date: '11/06/2025',
    changeDate: '2025-06-11',
    hasHints: true,
    status: 'pending',
    odpovědnyUzivatel: 'Jan Novák',
    skus: [
      { id: 'SKU-HER-001', name: 'Chamomile Tea 20 bags', responsibleUser: 'Jan Novák', status: 'pending' },
      { id: 'SKU-HER-002', name: 'Green Tea with Jasmine 20 bags', responsibleUser: 'Jan Novák', status: 'pending' },
      { id: 'SKU-HER-003', name: 'Mint Tea 20 bags', responsibleUser: 'Jan Novák', status: 'pending' },
      { id: 'SKU-HER-004', name: 'Lemon Balm Tea 20 bags', responsibleUser: 'Jan Novák', status: 'pending' },
      { id: 'SKU-HER-005', name: 'Elderflower Tea 20 bags', responsibleUser: 'Jan Novák', status: 'pending' },
      { id: 'SKU-HER-006', name: 'Ginger Tea 20 bags', responsibleUser: 'Jan Novák', status: 'pending' },
      { id: 'SKU-HER-007', name: 'Hibiscus Tea 20 bags', responsibleUser: 'Jan Novák', status: 'pending' },
      { id: 'SKU-HER-008', name: 'Rooibos Tea 20 bags', responsibleUser: 'Jan Novák', status: 'pending' }
    ]
  },
  {
    id: 'reznictvi-uzenafstvi',
    supplier: 'Řeznictví a uzenářství U DOLEJŠÍCH s.r.o',
    skuCount: 1,
    date: '11/06/2025',
    changeDate: '2025-06-11',
    hasHints: false,
    status: 'processed',
    odpovědnyUzivatel: 'Petr Svoboda',
    skus: [
      { id: 'SKU-REZ-001', name: 'Traditional Czech Sausage 200g', responsibleUser: 'Petr Svoboda', status: 'approved' }
    ]
  },
  {
    id: 'bajusz',
    supplier: 'BAJUSZ, s.r.o.',
    skuCount: 1,
    date: '11/06/2025',
    changeDate: '2025-06-11',
    hasHints: false,
    status: 'pending',
    odpovědnyUzivatel: 'Martin Pecha',
    skus: [
      { id: 'SKU-BAJ-001', name: 'Hungarian Spice Mix 50g', responsibleUser: 'Martin Pecha', status: 'pending' }
    ]
  },
  {
    id: 'bolton-czechia',
    supplier: 'BOLTON CZECHIA, spol. s r. o.',
    skuCount: 1,
    date: '11/06/2025',
    changeDate: '2025-06-11',
    hasHints: false,
    status: 'approved',
    odpovědnyUzivatel: 'Anna Horáková',
    skus: [
      { id: 'SKU-BOL-001', name: 'Rio Mare Tuna in Olive Oil 80g', responsibleUser: 'Anna Horáková', status: 'approved' }
    ]
  },
  {
    id: 'tierra-verde',
    supplier: 'TIERRA VERDE s.r.o.',
    skuCount: 1,
    date: '11/06/2025',
    changeDate: '2025-06-11',
    hasHints: false,
    status: 'pending',
    odpovědnyUzivatel: 'Jan Novák',
    skus: [
      { id: 'SKU-TIE-001', name: 'Eco Dishwashing Liquid 500ml', responsibleUser: 'Jan Novák', status: 'pending' }
    ]
  }
]; 