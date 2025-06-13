import React from 'react';
import { User, Globe } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'reservation', label: 'RESERVATION' },
    { id: 'performance', label: 'PERFORMANCE OVERVIEW' },
    { id: 'administration', label: 'ADMINISTRATION' },
    { id: 'product-pantry', label: 'PRODUCT PANTRY' },
    { id: 'pantry-signoff', label: 'PANTRY SIGN-OFF' }
  ];

  return (
    <div className="bg-white border-b border-gray-200">
      {/* Top header */}
      <div className="flex items-center justify-between px-6 py-3 bg-white">
        <div className="flex items-center space-x-2">
          <div className="text-orange-500 text-xl font-bold">rohlik</div>
          <div className="text-orange-500 text-lg">🥕</div>
          <div className="text-gray-600 text-lg font-medium">Supplier Portal</div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-500 hover:text-gray-700">
            <Globe className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700">
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="px-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`py-4 px-1 text-sm font-medium transition-colors relative ${
                activeTab === tab.id
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}; 