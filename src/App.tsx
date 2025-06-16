import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { SupplierPortal } from './components/SupplierPortal';
import { ProductDetailPage } from './components/ProductDetailPage';
import { SKUManagement } from './components/SKUManagement';
import { Package, Truck } from 'lucide-react';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b border-gray-200 mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex space-x-8">
                <Link 
                  to="/" 
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-blue-600"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Product Approval
                </Link>
                <Link 
                  to="/sku-management" 
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-blue-600"
                >
                  <Truck className="w-4 h-4 mr-2" />
                  SKU Management
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<SupplierPortal />} />
          <Route path="/product-pantry/:supplierId" element={<ProductDetailPage />} />
          <Route path="/sku-management" element={<SKUManagement />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;