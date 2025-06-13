import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Product } from '../types/Product';
import { fieldGroups } from '../data/fieldGroups';
import { RejectModal } from './RejectModal';

interface ProductTableProps {
  products: Product[];
}

export const ProductTable: React.FC<ProductTableProps> = ({ products }) => {
  const [rejectModal, setRejectModal] = useState<{
    isOpen: boolean;
    productId: string;
    productName: string;
  }>({
    isOpen: false,
    productId: '',
    productName: ''
  });

  const handleApprove = (productId: string, productName: string) => {
    console.log(`Approved product: ${productName} (${productId})`);
    // Here you would typically make an API call
  };

  const handleReject = (productId: string, productName: string) => {
    setRejectModal({
      isOpen: true,
      productId,
      productName
    });
  };

  const handleRejectSubmit = (comment: string) => {
    console.log(`Rejected product: ${rejectModal.productName} (${rejectModal.productId}) - Reason: ${comment}`);
    // Here you would typically make an API call
  };

  const truncateText = (text: string | string[], maxLength: number = 40): string => {
    if (Array.isArray(text)) {
      return text.join(', ').length > maxLength 
        ? `${text.join(', ').substring(0, maxLength)}...`
        : text.join(', ');
    }
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const getCellValue = (product: Product, fieldKey: string): string => {
    const value = product[fieldKey as keyof Product];
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return String(value || '-');
  };

  return (
    <div className="w-full h-screen bg-gray-50">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Kontrola produktů</h1>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-top">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="sticky left-0 z-20 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-64">
                      Pole
                    </th>
                    {products.map((product) => (
                      <th
                        key={product.id}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-80"
                      >
                        <div className="space-y-1">
                          <div className="font-semibold text-gray-900 text-sm">
                            {truncateText(product.nazevProduktu, 30)}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {product.id}
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                
                <tbody className="bg-white divide-y divide-gray-200">
                  {fieldGroups.map((group, groupIndex) => (
                    <React.Fragment key={group.title}>
                      {/* Section Header */}
                      <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-t-2 border-blue-200">
                        <td className="sticky left-0 z-10 px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-r border-gray-200">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{group.emoji}</span>
                            <span className="font-bold text-sm text-blue-900 uppercase tracking-wide">
                              {group.title}
                            </span>
                          </div>
                        </td>
                        {products.map((product) => (
                          <td
                            key={product.id}
                            className="px-4 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-r border-gray-200"
                          />
                        ))}
                      </tr>
                      
                      {/* Section Fields */}
                      {group.fields.map((field, fieldIndex) => (
                        <tr
                          key={`${group.title}-${field.key}`}
                          className={`hover:bg-gray-50 transition-colors ${
                            fieldIndex % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                          }`}
                        >
                          <td className="sticky left-0 z-10 px-6 py-3 bg-inherit border-r border-gray-200">
                            <div className="text-sm font-medium text-gray-900">
                              {field.label}
                            </div>
                          </td>
                          {products.map((product) => (
                            <td
                              key={product.id}
                              className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200"
                            >
                              <div 
                                className="truncate max-w-xs"
                                title={getCellValue(product, field.key)}
                              >
                                {truncateText(getCellValue(product, field.key))}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                  
                  {/* Action Buttons Row */}
                  <tr className="bg-gray-50 border-t-2 border-gray-300">
                    <td className="sticky left-0 z-10 px-6 py-4 bg-gray-50 border-r border-gray-200">
                      <div className="font-bold text-sm text-gray-900 uppercase tracking-wide">
                        ⚡ AKCE
                      </div>
                    </td>
                    {products.map((product) => (
                      <td key={product.id} className="px-4 py-4 border-r border-gray-200">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApprove(product.id, product.nazevProduktu)}
                            className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                          >
                            <Check className="w-3 h-3" />
                            <span>Schválit</span>
                          </button>
                          <button
                            onClick={() => handleReject(product.id, product.nazevProduktu)}
                            className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                          >
                            <X className="w-3 h-3" />
                            <span>Zamítnout</span>
                          </button>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <RejectModal
        isOpen={rejectModal.isOpen}
        onClose={() => setRejectModal({ isOpen: false, productId: '', productName: '' })}
        onSubmit={handleRejectSubmit}
        productName={rejectModal.productName}
      />
    </div>
  );
};