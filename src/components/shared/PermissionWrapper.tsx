import React from 'react';
import { UserRole } from '../../types/Workflow';
import { Navigate } from 'react-router-dom';

interface PermissionWrapperProps {
  allowedRoles: UserRole[];
  userRole: UserRole;
  children: React.ReactNode;
  fallbackPath?: string;
}

export const PermissionWrapper: React.FC<PermissionWrapperProps> = ({
  allowedRoles,
  userRole,
  children,
  fallbackPath = '/'
}) => {
  const hasPermission = allowedRoles.includes(userRole);

  if (!hasPermission) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

// Hook for checking permissions
export const usePermissions = (userRole: UserRole) => {
  const hasRole = (roles: UserRole[]): boolean => {
    return roles.includes(userRole);
  };

  const canEdit = (state: string, role: UserRole): boolean => {
    // Define edit permissions based on workflow state and role
    const permissions: Record<string, UserRole[]> = {
      'waiting_for_capacity': [UserRole.COMMERCIAL],
      'assign_warehouse_position': [UserRole.STOCK_PLANNER],
      'waiting_for_order': [UserRole.SUPPLY_CHAIN],
    };

    return permissions[state]?.includes(role) || false;
  };

  return {
    hasRole,
    canEdit,
    isCommercial: userRole === UserRole.COMMERCIAL,
    isStockPlanner: userRole === UserRole.STOCK_PLANNER,
    isSupplyChain: userRole === UserRole.SUPPLY_CHAIN,
    isSupplier: userRole === UserRole.SUPPLIER,
  };
};