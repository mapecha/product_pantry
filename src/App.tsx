import React from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { SupplierPortal } from './components/SupplierPortal';
import { ProductDetailPage } from './components/ProductDetailPage';
import { UserProfile } from './components/UserProfile';
import { SupplierAuth } from './components/SupplierAuth';
import { SupplierOnboarding } from './components/SupplierOnboarding';

// Wrapper component for SupplierAuth to handle routing
const SupplierAuthWrapper: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const handleAuthSuccess = (onboardingId: string) => {
    navigate(`/onboarding/${onboardingId}`);
  };
  
  if (!token) {
    return <div>Invalid invitation link</div>;
  }
  
  return <SupplierAuth token={token} onAuthSuccess={handleAuthSuccess} />;
};

// Wrapper component for SupplierOnboarding to handle routing
const SupplierOnboardingWrapper: React.FC = () => {
  const { onboardingId } = useParams<{ onboardingId: string }>();
  
  if (!onboardingId) {
    return <div>Invalid onboarding link</div>;
  }
  
  return <SupplierOnboarding onboardingId={onboardingId} />;
};

// Wrapper component for handling /supplier-onboarding with query parameters
const SupplierOnboardingQueryWrapper: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const onboardingId = searchParams.get('onboardingId');
  
  // Debug logging
  console.log('SupplierOnboardingQueryWrapper rendered');
  console.log('Token:', token);
  console.log('OnboardingId:', onboardingId);
  console.log('Search params:', Array.from(searchParams.entries()));
  
  const handleAuthSuccess = (newOnboardingId: string) => {
    navigate(`/supplier-onboarding?onboardingId=${newOnboardingId}`);
  };
  
  // If we have a token, show the auth component
  if (token) {
    console.log('Rendering SupplierAuth with token:', token);
    return <SupplierAuth token={token} onAuthSuccess={handleAuthSuccess} />;
  }
  
  // If we have an onboardingId, show the onboarding component
  if (onboardingId) {
    console.log('Rendering SupplierOnboarding with onboardingId:', onboardingId);
    return <SupplierOnboarding onboardingId={onboardingId} />;
  }
  
  // If neither, show error
  console.log('No valid parameters found, showing error');
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid Link</h2>
          <p className="text-gray-600 mb-4">
            This supplier onboarding link is missing required parameters.
          </p>
          <p className="text-sm text-gray-500">
            Please check the link or contact support for assistance.
          </p>
          <div className="mt-4 text-xs text-gray-400">
            <p>Debug info:</p>
            <p>Token: {token || 'null'}</p>
            <p>OnboardingId: {onboardingId || 'null'}</p>
            <p>All params: {JSON.stringify(Array.from(searchParams.entries()))}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<SupplierPortal />} />
          <Route path="/sku-management" element={<SupplierPortal />} />
          <Route path="/product-pantry/:supplierId" element={<ProductDetailPage />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/auth/:token" element={<SupplierAuthWrapper />} />
          <Route path="/onboarding/:onboardingId" element={<SupplierOnboardingWrapper />} />
          <Route path="/supplier-onboarding" element={<SupplierOnboardingQueryWrapper />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;