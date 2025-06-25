import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SupplierPortal } from './components/SupplierPortal';
import { ProductDetailPage } from './components/ProductDetailPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<SupplierPortal />} />
          <Route path="/sku-management" element={<SupplierPortal />} />
          <Route path="/product-pantry/:supplierId" element={<ProductDetailPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;