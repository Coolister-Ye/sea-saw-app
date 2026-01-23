import React, { ReactNode } from "react";
import { usePermission, RoleType } from "@/hooks/usePermission";
import { PermissionDenied } from "./PermissionDenied";

interface PermissionGuardProps {
  children: ReactNode;
  /** Permission string to check (e.g., "crm.delete_order") */
  permission?: string;
  /** Role required to view content */
  role?: RoleType;
  /** Any of these roles can view content */
  anyRole?: RoleType[];
  /** All of these roles required to view content */
  allRoles?: RoleType[];
  /** Group name required to view content */
  group?: string;
  /** Resource and action (e.g., resource="order", action="view") */
  resource?: string;
  action?: "view" | "create" | "edit" | "delete";
  /** Owner ID - if provided, checks if current user is owner */
  ownerId?: number;
  /** What to render when permission denied (default: PermissionDenied component) */
  fallback?: ReactNode;
  /** If true, renders nothing when denied. If false, renders fallback */
  hideWhenDenied?: boolean;
}

/**
 * PermissionGuard Component
 *
 * Wraps children and only renders them if user has required permissions.
 * Can check for permissions, roles, groups, or resource actions.
 *
 * @example
 * // Check by role
 * <PermissionGuard role="ADMIN">
 *   <AdminPanel />
 * </PermissionGuard>
 *
 * @example
 * // Check by resource action
 * <PermissionGuard resource="order" action="delete">
 *   <DeleteButton />
 * </PermissionGuard>
 *
 * @example
 * // Check multiple roles (any)
 * <PermissionGuard anyRole={['SALE', 'ADMIN']}>
 *   <OrderForm />
 * </PermissionGuard>
 *
 * @example
 * // Check if user is owner
 * <PermissionGuard resource="order" action="edit" ownerId={order.owner_id}>
 *   <EditButton />
 * </PermissionGuard>
 *
 * @example
 * // Hide when denied (no fallback)
 * <PermissionGuard role="ADMIN" hideWhenDenied>
 *   <AdminButton />
 * </PermissionGuard>
 */
export function PermissionGuard({
  children,
  permission,
  role,
  anyRole,
  allRoles,
  group,
  resource,
  action,
  ownerId,
  fallback,
  hideWhenDenied = false,
}: PermissionGuardProps) {
  const {
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
  } = usePermission();

  let hasAccess = true;

  // Check permission string
  if (permission && !hasPermission(permission)) {
    hasAccess = false;
  }

  // Check specific role
  if (role && !hasRole(role)) {
    hasAccess = false;
  }

  // Check any role
  if (anyRole && !hasAnyRole(anyRole)) {
    hasAccess = false;
  }

  // Check all roles
  if (allRoles && !hasAllRoles(allRoles)) {
    hasAccess = false;
  }

  // Check group
  if (group && !hasGroup(group)) {
    hasAccess = false;
  }

  // Check resource action
  if (resource && action) {
    switch (action) {
      case "view":
        if (!canView(resource)) hasAccess = false;
        break;
      case "create":
        if (!canCreate(resource)) hasAccess = false;
        break;
      case "edit":
        if (!canEdit(resource)) hasAccess = false;
        break;
      case "delete":
        if (!canDelete(resource)) hasAccess = false;
        break;
    }
  }

  // Check ownership (additional check, not standalone)
  if (ownerId !== undefined && !isOwner(ownerId)) {
    hasAccess = false;
  }

  // Render based on access
  if (hasAccess) {
    return <>{children}</>;
  }

  // Access denied
  if (hideWhenDenied) {
    return null;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return <PermissionDenied />;
}
