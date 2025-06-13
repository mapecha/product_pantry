import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ProductTable } from './ProductTable';
import { products } from '../data/products';
import { suppliers } from '../data/suppliers';

export const ProductDetailPage: React.FC = () => {
  const { supplierId } = useParams<{ supplierId: string }>();
  const navigate = useNavigate();

  // Find the supplier for the header
  const supplier = suppliers.find(s => s.id === supplierId);
  
  // In a real app, you would filter products by supplier
  // For now, we'll show all products as in the original design
  const supplierProducts = products;

  const handleBackClick = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back navigation */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBackClick}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Supplier Portal</span>
          </button>
          
          {supplier && (
            <div className="flex items-center space-x-2">
              <div className="w-1 h-6 bg-green-500 rounded"></div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{supplier.supplier}</h1>
                <p className="text-sm text-gray-500">Product Review - {supplier.skuCount} SKU(s)</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Table */}
      <ProductTable products={supplierProducts} />
    </div>
  );
}; 