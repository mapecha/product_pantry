import React from 'react';
import { ProductTable } from './components/ProductTable';
import { products } from './data/products';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ProductTable products={products} />
    </div>
  );
}

export default App;