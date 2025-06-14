import React from 'react';
import { ProductTable } from '../../components/ProductTable';
import { products as mockProducts } from '../../data/products';

export const ProductApproval: React.FC = () => {
  // In a real app, you would filter for only pending approval products
  const pendingProducts = mockProducts.filter(p => 
    // Simulating pending products - in real app would check workflow state
    p.stav === 'Nový' || p.stav === 'Čeká na schválení'
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Product Approval</h1>
        <p className="mt-1 text-sm text-gray-600">
          Review and approve products for onboarding. Approved products will enter the capacity queue.
        </p>
      </div>

      <ProductTable products={pendingProducts} />
    </div>
  );
};