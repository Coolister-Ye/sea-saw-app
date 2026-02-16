/**
 * Pipeline Status Constants
 *
 * Defines status values and edit permission rules for Pipeline and sub-entities.
 * These should match the backend definitions in sea_saw_crm/constants/status_sync_constants.py
 */

// Pipeline status values
export const PipelineStatus = {
  DRAFT: "draft",
  ORDER_CONFIRMED: "order_confirmed",
  IN_PRODUCTION: "in_production",
  PRODUCTION_COMPLETED: "production_completed",
  IN_PURCHASE: "in_purchase",
  PURCHASE_COMPLETED: "purchase_completed",
  IN_PURCHASE_AND_PRODUCTION: "in_purchase_and_production",
  PURCHASE_AND_PRODUCTION_COMPLETED: "purchase_and_production_completed",
  IN_OUTBOUND: "in_outbound",
  OUTBOUND_COMPLETED: "outbound_completed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  ISSUE_REPORTED: "issue_reported",
} as const;

// Active entity types (matches backend ActiveEntityType)
export const ActiveEntityType = {
  NONE: "none",
  ORDER: "order",
  PRODUCTION: "production",
  PURCHASE: "purchase",
  PRODUCTION_AND_PURCHASE: "production_and_purchase",
  OUTBOUND: "outbound",
} as const;

// Simplified sub-entity status values
export const SubEntityStatus = {
  DRAFT: "draft",
  ACTIVE: "active",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  ISSUE_REPORTED: "issue_reported",
} as const;

// Terminal statuses that cannot be edited
const TERMINAL_STATUSES = new Set([
  SubEntityStatus.COMPLETED,
  SubEntityStatus.CANCELLED,
  SubEntityStatus.ISSUE_REPORTED,
]);

/**
 * Determines if an Order can be edited based on pipeline state and order status.
 *
 * Order is editable when:
 * - Pipeline status is DRAFT, or
 * - Pipeline status is ORDER_CONFIRMED and order is active
 */
export function canEditOrder(
  pipelineStatus: string,
  orderStatus: string,
): boolean {
  // Order can be edited in draft state
  if (pipelineStatus === PipelineStatus.DRAFT) {
    return orderStatus === SubEntityStatus.DRAFT;
  }

  return false;
}

/**
 * Determines if a ProductionOrder can be edited.
 *
 * ProductionOrder is editable when:
 * - Pipeline active_entity is "production", AND
 * - Pipeline status is IN_PRODUCTION, AND
 * - ProductionOrder status is ACTIVE (not terminal)
 */
export function canEditProductionOrder(
  pipelineStatus: string,
  activeEntity: string,
  productionOrderStatus: string,
): boolean {
  // Must be the active entity (production or hybrid)
  if (
    activeEntity !== ActiveEntityType.PRODUCTION &&
    activeEntity !== ActiveEntityType.PRODUCTION_AND_PURCHASE
  ) {
    return false;
  }

  // Pipeline must be in production or hybrid phase
  if (
    pipelineStatus !== PipelineStatus.IN_PRODUCTION &&
    pipelineStatus !== PipelineStatus.IN_PURCHASE_AND_PRODUCTION
  ) {
    return false;
  }

  // ProductionOrder must be in active (editable) status
  return productionOrderStatus === SubEntityStatus.ACTIVE;
}

/**
 * Determines if a PurchaseOrder can be edited.
 *
 * PurchaseOrder is editable when:
 * - Pipeline active_entity is "purchase", AND
 * - Pipeline status is IN_PURCHASE, AND
 * - PurchaseOrder status is ACTIVE (not terminal)
 */
export function canEditPurchaseOrder(
  pipelineStatus: string,
  activeEntity: string,
  purchaseOrderStatus: string,
): boolean {
  // Must be the active entity (purchase or hybrid)
  if (
    activeEntity !== ActiveEntityType.PURCHASE &&
    activeEntity !== ActiveEntityType.PRODUCTION_AND_PURCHASE
  ) {
    return false;
  }

  // Pipeline must be in purchase or hybrid phase
  if (
    pipelineStatus !== PipelineStatus.IN_PURCHASE &&
    pipelineStatus !== PipelineStatus.IN_PURCHASE_AND_PRODUCTION
  ) {
    return false;
  }

  // PurchaseOrder must be in active (editable) status
  return purchaseOrderStatus === SubEntityStatus.ACTIVE;
}

/**
 * Determines if an OutboundOrder can be edited.
 *
 * OutboundOrder is editable when:
 * - Pipeline active_entity is "outbound", AND
 * - Pipeline status is IN_OUTBOUND, AND
 * - OutboundOrder status is ACTIVE (not terminal)
 */
export function canEditOutboundOrder(
  pipelineStatus: string,
  activeEntity: string,
  outboundOrderStatus: string,
): boolean {
  // Must be the active entity
  if (activeEntity !== ActiveEntityType.OUTBOUND) {
    return false;
  }

  // Pipeline must be in outbound phase
  if (pipelineStatus !== PipelineStatus.IN_OUTBOUND) {
    return false;
  }

  // OutboundOrder must be in active (editable) status
  return outboundOrderStatus === SubEntityStatus.ACTIVE;
}

/**
 * Determines if a Payment can be edited.
 *
 * Payments are generally editable unless:
 * - Pipeline is COMPLETED or CANCELLED
 */
export function canEditPayment(pipelineStatus: string): boolean {
  return (
    pipelineStatus !== PipelineStatus.COMPLETED &&
    pipelineStatus !== PipelineStatus.CANCELLED
  );
}

/**
 * Determines if a sub-entity can be created based on pipeline status.
 */
export function canCreateSubEntity(
  pipelineStatus: string,
  entityType: "production" | "purchase" | "outbound",
): boolean {
  switch (entityType) {
    case "production":
      // Can create production orders when pipeline is ORDER_CONFIRMED or later (not completed/cancelled)
      return ![
        PipelineStatus.DRAFT,
        PipelineStatus.COMPLETED,
        PipelineStatus.CANCELLED,
      ].includes(pipelineStatus as any);

    case "purchase":
      // Can create purchase orders when pipeline is ORDER_CONFIRMED or later (not completed/cancelled)
      return ![
        PipelineStatus.DRAFT,
        PipelineStatus.COMPLETED,
        PipelineStatus.CANCELLED,
      ].includes(pipelineStatus as any);

    case "outbound":
      // Can create outbound orders when production/purchase is completed
      return [
        PipelineStatus.PRODUCTION_COMPLETED,
        PipelineStatus.PURCHASE_COMPLETED,
        PipelineStatus.PURCHASE_AND_PRODUCTION_COMPLETED,
        PipelineStatus.IN_OUTBOUND,
      ].includes(pipelineStatus as any);

    default:
      return false;
  }
}
