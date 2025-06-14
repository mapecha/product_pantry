import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Package, Users, FileText, Settings, ShoppingCart, Warehouse, Truck, Eye } from 'lucide-react';
import { UserRole } from '../../types/Workflow';

interface NavigationItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

interface RoleNavigationProps {
  userRole: string;
}

export const RoleNavigation: React.FC<RoleNavigationProps> = ({ userRole }) => {
  const location = useLocation();

  const navigationItems: Record<string, NavigationItem[]> = {
    [UserRole.COMMERCIAL]: [
      { path: '/commercial', label: 'Dashboard', icon: <Home className="w-4 h-4" /> },
      { path: '/commercial/products', label: 'Product Approval', icon: <Package className="w-4 h-4" /> },
      { path: '/commercial/queue', label: 'Capacity Queue', icon: <Users className="w-4 h-4" /> },
      { path: '/commercial/reports', label: 'Reports', icon: <FileText className="w-4 h-4" /> },
    ],
    [UserRole.STOCK_PLANNER]: [
      { path: '/stock-planner', label: 'Dashboard', icon: <Home className="w-4 h-4" /> },
      { path: '/stock-planner/assignments', label: 'Warehouse Assignments', icon: <Warehouse className="w-4 h-4" /> },
      { path: '/stock-planner/capacity', label: 'Capacity Management', icon: <Package className="w-4 h-4" /> },
      { path: '/stock-planner/history', label: 'Assignment History', icon: <FileText className="w-4 h-4" /> },
    ],
    [UserRole.SUPPLY_CHAIN]: [
      { path: '/supply-chain', label: 'Dashboard', icon: <Home className="w-4 h-4" /> },
      { path: '/supply-chain/tasks', label: 'Task Management', icon: <ShoppingCart className="w-4 h-4" /> },
      { path: '/supply-chain/edi', label: 'EDI Connections', icon: <Truck className="w-4 h-4" /> },
      { path: '/supply-chain/orders', label: 'Order Management', icon: <Package className="w-4 h-4" /> },
      { path: '/supply-chain/history', label: 'History', icon: <FileText className="w-4 h-4" /> },
    ],
    [UserRole.SUPPLIER]: [
      { path: '/supplier', label: 'Dashboard', icon: <Home className="w-4 h-4" /> },
      { path: '/supplier/products', label: 'My Products', icon: <Package className="w-4 h-4" /> },
      { path: '/supplier/status', label: 'Status Overview', icon: <Eye className="w-4 h-4" /> },
    ],
  };

  const items = navigationItems[userRole] || [];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Workflow Management
              </h1>
            </div>

            {/* Navigation Links */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {items.map((item) => {
                const isActive = location.pathname === item.path || 
                               (item.path !== '/' && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User info */}
          <div className="flex items-center">
            <div className="ml-3 relative">
              <div className="flex items-center">
                <span className="text-sm text-gray-700 mr-2">Role:</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {userRole.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};