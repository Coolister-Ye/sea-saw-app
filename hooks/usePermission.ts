import { useAuthStore, selectUser, selectIsStaff, selectIsAdmin } from "@/stores/authStore";
import { useMemo } from "react";

/**
 * Permission Hook
 *
 * Provides fine-grained permission checking utilities
 *
 * @example
 * const { hasPermission, hasRole, hasAnyRole, hasAllRoles, canEdit, canDelete } = usePermission();
 *
 * if (hasRole('ADMIN')) {
 *   // Admin-only logic
 * }
 *
 * if (canEdit('order')) {
 *   // Show edit button
 * }
 */

export type RoleType = 'ADMIN' | 'SALE' | 'PRODUCTION' | 'WAREHOUSE' | 'FINANCE' | 'UNKNOWN';

export interface PermissionCheck {
  hasPermission: (permission: string) => boolean;
  hasRole: (role: RoleType) => boolean;
  hasAnyRole: (roles: RoleType[]) => boolean;
  hasAllRoles: (roles: RoleType[]) => boolean;
  hasGroup: (groupName: string) => boolean;
  canView: (resource: string) => boolean;
  canCreate: (resource: string) => boolean;
  canEdit: (resource: string) => boolean;
  canDelete: (resource: string) => boolean;
  isOwner: (ownerId?: number) => boolean;
}

export function usePermission(): PermissionCheck {
  const user = useAuthStore(selectUser);
  const isStaff = useAuthStore(selectIsStaff);
  const isAdmin = useAuthStore(selectIsAdmin);
  const isGroupX = useAuthStore((state) => state.isGroupX);

  const currentRole = useMemo(() => user?.role?.role_type, [user]);

  /**
   * Check if user has a specific permission string
   * Format: "app.action_resource" (e.g., "crm.delete_order")
   */
  const hasPermission = (permission: string): boolean => {
    // Admin has all permissions
    if (isAdmin || isStaff) {
      return true;
    }

    // TODO: Implement fine-grained permission checking
    // This would require backend to send user permissions
    return false;
  };

  /**
   * Check if user has a specific role
   */
  const hasRole = (role: RoleType): boolean => {
    if (isAdmin || isStaff) {
      return true;
    }
    return currentRole === role;
  };

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = (roles: RoleType[]): boolean => {
    if (isAdmin || isStaff) {
      return true;
    }
    return roles.some((role) => currentRole === role);
  };

  /**
   * Check if user has all of the specified roles
   */
  const hasAllRoles = (roles: RoleType[]): boolean => {
    if (isAdmin || isStaff) {
      return true;
    }
    // A user can only have one role, so this only works for single role
    return roles.length === 1 && currentRole === roles[0];
  };

  /**
   * Check if user belongs to a specific group
   */
  const hasGroup = (groupName: string): boolean => {
    if (isAdmin || isStaff) {
      return true;
    }
    return isGroupX(groupName);
  };

  /**
   * Check if user can view a resource
   */
  const canView = (resource: string): boolean => {
    // Admin can view everything
    if (isAdmin || isStaff) {
      return true;
    }

    // Resource-specific view permissions
    switch (resource) {
      case 'order':
      case 'company':
      case 'contact':
        return hasAnyRole(['SALE', 'ADMIN']);
      case 'production':
        return hasAnyRole(['PRODUCTION', 'ADMIN']);
      case 'pipeline':
        return hasAnyRole(['SALE', 'PRODUCTION', 'WAREHOUSE', 'ADMIN']);
      case 'payment':
        return hasAnyRole(['SALE', 'FINANCE', 'ADMIN']);
      case 'download':
        return true; // All authenticated users can view downloads
      default:
        return false;
    }
  };

  /**
   * Check if user can create a resource
   */
  const canCreate = (resource: string): boolean => {
    // Admin can create everything
    if (isAdmin || isStaff) {
      return true;
    }

    // Resource-specific create permissions
    switch (resource) {
      case 'order':
      case 'company':
      case 'contact':
        return hasAnyRole(['SALE', 'ADMIN']);
      case 'production':
        return hasAnyRole(['PRODUCTION', 'ADMIN']);
      case 'pipeline':
        return hasAnyRole(['SALE', 'ADMIN']);
      case 'payment':
        return hasAnyRole(['SALE', 'FINANCE', 'ADMIN']);
      default:
        return false;
    }
  };

  /**
   * Check if user can edit a resource
   */
  const canEdit = (resource: string): boolean => {
    // Admin can edit everything
    if (isAdmin || isStaff) {
      return true;
    }

    // Resource-specific edit permissions
    switch (resource) {
      case 'order':
      case 'company':
      case 'contact':
        return hasAnyRole(['SALE', 'ADMIN']);
      case 'production':
        return hasAnyRole(['PRODUCTION', 'ADMIN']);
      case 'pipeline':
        return hasAnyRole(['SALE', 'PRODUCTION', 'WAREHOUSE', 'ADMIN']);
      case 'payment':
        return hasAnyRole(['SALE', 'FINANCE', 'ADMIN']);
      default:
        return false;
    }
  };

  /**
   * Check if user can delete a resource
   */
  const canDelete = (resource: string): boolean => {
    // Only admin can delete
    if (isAdmin || isStaff) {
      return true;
    }

    // Most resources require admin for deletion
    return false;
  };

  /**
   * Check if user is the owner of a resource
   */
  const isOwner = (ownerId?: number): boolean => {
    if (!ownerId || !user) {
      return false;
    }
    return user.id === ownerId;
  };

  return {
    hasPermission,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    hasGroup,
    canView,
    canCreate,
    canEdit,
    canDelete,
    isOwner,
  };
}
