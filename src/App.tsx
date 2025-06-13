import React from 'react';
import { ProductTable } from './components/ProductTable';
import { products } from './data/products';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Testing Banner */}
      <div className="bg-yellow-400 border-b-2 border-yellow-600 px-4 py-3">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <span className="text-black font-bold text-lg">🧪 TESTING ENVIRONMENT</span>
            <p className="text-black text-sm mt-1">
              This is a testing version of Product Pantry - Changes are being tested before going live
            </p>
          </div>
        </div>
      </div>
      
      <ProductTable products={products} />
    </div>
  );
}

export default App;