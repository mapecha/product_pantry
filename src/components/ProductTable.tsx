import React, { useState } from 'react';
import { Check, X, ChevronDown, ChevronRight, Table, Grid } from 'lucide-react';
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

  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<'table' | 'products'>('table');
  const [collapsedProducts, setCollapsedProducts] = useState<Record<string, boolean>>({});
  const [collapsedProductSections, setCollapsedProductSections] = useState<Record<string, Record<string, boolean>>>({});

  const handleApprove = (productId: string, productName: string) => {
    console.log(`[TESTING] Approved product: ${productName} (${productId})`);
    alert(`🧪 Testing Mode: Would approve "${productName}"`);
    // Here you would typically make an API call
  };

  const handleReject = (productId: string, productName: string) => {
    console.log(`[TESTING] Rejecting product: ${productName} (${productId})`);
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

  const toggleSection = (sectionTitle: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

  const toggleProduct = (productId: string) => {
    setCollapsedProducts(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const toggleProductSection = (productId: string, sectionTitle: string) => {
    setCollapsedProductSections(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [sectionTitle]: !prev[productId]?.[sectionTitle]
      }
    }));
  };

  return (
    <div className="w-full h-screen bg-gray-50">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-gray-900">Kontrola produktů</h1>
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              🚀 Testing Version v2.0
            </span>
          </div>
          <div className="flex items-center space-x-4">
            {/* View Switcher */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'table' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Table className="w-4 h-4" />
                <span>Table View</span>
              </button>
              <button
                onClick={() => setViewMode('products')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'products' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid className="w-4 h-4" />
                <span>Product View</span>
              </button>
            </div>
            
            {/* Collapse/Expand Controls */}
            <div className="flex space-x-2">
            {viewMode === 'table' ? (
              <>
                <button
                  onClick={() => setCollapsedSections({})}
                  className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors"
                >
                  Expand All Sections
                </button>
                <button
                  onClick={() => {
                    const allCollapsed = fieldGroups.reduce((acc, group) => ({
                      ...acc,
                      [group.title]: true
                    }), {});
                    setCollapsedSections(allCollapsed);
                  }}
                  className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors"
                >
                  Collapse All Sections
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setCollapsedProducts({});
                    setCollapsedProductSections({});
                  }}
                  className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors"
                >
                  Expand All
                </button>
                <button
                  onClick={() => {
                    const allProductsCollapsed = products.reduce((acc, product) => ({
                      ...acc,
                      [product.id]: true
                    }), {});
                    setCollapsedProducts(allProductsCollapsed);
                  }}
                  className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors"
                >
                  Collapse All Products
                </button>
              </>
            )}
          </div>
        </div>
        </div>
        
        {/* Table View */}
        {viewMode === 'table' && (
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
                          <button 
                            className="flex items-center space-x-2 w-full text-left hover:bg-blue-100 p-2 rounded transition-colors"
                            onClick={() => toggleSection(group.title)}
                          >
                            {collapsedSections[group.title] ? (
                              <ChevronRight className="w-4 h-4 text-blue-700" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-blue-700" />
                            )}
                            <span className="text-lg">{group.emoji}</span>
                            <span className="font-bold text-sm text-blue-900 uppercase tracking-wide">
                              {group.title}
                            </span>
                          </button>
                        </td>
                        {products.map((product) => (
                          <td
                            key={product.id}
                            className="px-4 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-r border-gray-200"
                          />
                        ))}
                      </tr>
                      
                      {/* Section Fields */}
                      {!collapsedSections[group.title] && group.fields.map((field, fieldIndex) => (
                        <tr
                          key={`${group.title}-${field.key}`}
                          className={`hover:bg-gray-50 transition-colors ${
                            fieldIndex % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                          }`}
                        >
                          <td className={`sticky left-0 z-10 px-6 py-3 border-r border-gray-200 ${
                            fieldIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }`}>
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
        )}

        {/* Product View */}
        {viewMode === 'products' && (
          <div className="space-y-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Product Header */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <button
                    className="w-full px-6 py-4 text-left hover:bg-gray-100 transition-colors"
                    onClick={() => toggleProduct(product.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {collapsedProducts[product.id] ? (
                          <ChevronRight className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-600" />
                        )}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {product.nazevProduktu}
                          </h3>
                          <p className="text-sm text-gray-500">ID: {product.id}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApprove(product.id, product.nazevProduktu);
                          }}
                          className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                        >
                          <Check className="w-3 h-3" />
                          <span>Schválit</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReject(product.id, product.nazevProduktu);
                          }}
                          className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        >
                          <X className="w-3 h-3" />
                          <span>Zamítnout</span>
                        </button>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Product Details */}
                {!collapsedProducts[product.id] && (
                  <div className="p-6">
                    <div className="space-y-4">
                      {fieldGroups.map((group) => (
                        <div key={group.title} className="border border-gray-200 rounded-lg overflow-hidden">
                          {/* Section Header */}
                          <button
                            className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 text-left hover:bg-blue-100 transition-colors border-b border-blue-200"
                            onClick={() => toggleProductSection(product.id, group.title)}
                          >
                            <div className="flex items-center space-x-2">
                              {collapsedProductSections[product.id]?.[group.title] ? (
                                <ChevronRight className="w-4 h-4 text-blue-700" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-blue-700" />
                              )}
                              <span className="text-lg">{group.emoji}</span>
                              <span className="font-bold text-sm text-blue-900 uppercase tracking-wide">
                                {group.title}
                              </span>
                            </div>
                          </button>

                          {/* Section Fields */}
                          {!collapsedProductSections[product.id]?.[group.title] && (
                            <div className="bg-white">
                              {group.fields.map((field, fieldIndex) => (
                                <div
                                  key={field.key}
                                  className={`px-4 py-3 border-b border-gray-100 last:border-b-0 ${
                                    fieldIndex % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                                  }`}
                                >
                                  <div className="flex justify-between items-start">
                                    <div className="font-medium text-gray-900 text-sm min-w-0 w-1/3">
                                      {field.label}
                                    </div>
                                    <div className="text-sm text-gray-700 min-w-0 w-2/3 pl-4">
                                      <div 
                                        className="break-words"
                                        title={getCellValue(product, field.key)}
                                      >
                                        {getCellValue(product, field.key)}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
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