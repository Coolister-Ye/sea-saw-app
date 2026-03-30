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

// Order status values — independent sales document lifecycle
export const OrderStatus = {
  DRAFT: "draft",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
} as const;

// Simplified sub-entity status values (for production/purchase/outbound)
export const SubEntityStatus = {
  DRAFT: "draft",
  ACTIVE: "active",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  ISSUE_REPORTED: "issue_reported",
} as const;

// Statuses considered "closed" — terminal states that do not block pipeline advancement
export const CLOSED_SUB_ENTITY_STATUSES: string[] = [
  SubEntityStatus.COMPLETED,
  SubEntityStatus.CANCELLED,
];

// Maps pipeline target status → which sub-entity arrays must all be closed before advancing.
// Used by the frontend to show a pre-transition warning when some sub-entities are still open.
export const TRANSITION_ENTITY_CHECK: Partial<Record<string, string[]>> = {
  purchase_completed: ["purchase_orders"],
  production_completed: ["production_orders"],
  outbound_completed: ["outbound_orders"],
  purchase_and_production_completed: ["purchase_orders", "production_orders"],
  completed: ["outbound_orders"],
};

/**
 * Determines if an Order can be edited.
 *
 * Order is editable when:
 * - Pipeline is in DRAFT status (order can be re-edited after pipeline rollback), OR
 * - Order's own status is DRAFT (not yet confirmed)
 *
 * @param pipelineStatus - Current pipeline status
 * @param orderStatus - Current order status
 */
export function canEditOrder(
  pipelineStatus: string,
  orderStatus: string,
): boolean {
  return (
    pipelineStatus === PipelineStatus.DRAFT || orderStatus === OrderStatus.DRAFT
  );
}

/**
 * Determines if a ProductionOrder can be edited.
 *
 * ProductionOrder is editable solely based on pipeline phase — sub-entity
 * status does not restrict editing. Users can freely update production orders
 * (including completed ones) as long as the pipeline is in the production phase.
 *
 * Editable when:
 * - Pipeline active_entity is "production" or "production_and_purchase", AND
 * - Pipeline status is IN_PRODUCTION or IN_PURCHASE_AND_PRODUCTION
 */
export function canEditProductionOrder(
  pipelineStatus: string,
  activeEntity: string,
): boolean {
  return (
    (activeEntity === ActiveEntityType.PRODUCTION ||
      activeEntity === ActiveEntityType.PRODUCTION_AND_PURCHASE) &&
    (pipelineStatus === PipelineStatus.ORDER_CONFIRMED ||
      pipelineStatus === PipelineStatus.IN_PRODUCTION ||
      pipelineStatus === PipelineStatus.IN_PURCHASE_AND_PRODUCTION)
  );
}

/**
 * Determines if a PurchaseOrder can be edited.
 *
 * PurchaseOrder is editable solely based on pipeline phase — sub-entity
 * status does not restrict editing.
 *
 * Editable when:
 * - Pipeline active_entity is "purchase" or "production_and_purchase", AND
 * - Pipeline status is IN_PURCHASE or IN_PURCHASE_AND_PRODUCTION
 */
export function canEditPurchaseOrder(
  pipelineStatus: string,
  activeEntity: string,
): boolean {
  return (
    (activeEntity === ActiveEntityType.PURCHASE ||
      activeEntity === ActiveEntityType.PRODUCTION_AND_PURCHASE) &&
    (pipelineStatus === PipelineStatus.ORDER_CONFIRMED ||
      pipelineStatus === PipelineStatus.IN_PURCHASE ||
      pipelineStatus === PipelineStatus.IN_PURCHASE_AND_PRODUCTION)
  );
}

/**
 * Determines if an OutboundOrder can be edited.
 *
 * OutboundOrder is editable solely based on pipeline phase — sub-entity
 * status does not restrict editing.
 *
 * Editable when:
 * - Pipeline active_entity is "outbound", AND
 * - Pipeline status is IN_OUTBOUND
 */
export function canEditOutboundOrder(
  pipelineStatus: string,
  activeEntity: string,
): boolean {
  return (
    activeEntity === ActiveEntityType.OUTBOUND &&
    (pipelineStatus === PipelineStatus.PURCHASE_COMPLETED ||
      pipelineStatus === PipelineStatus.PRODUCTION_COMPLETED ||
      pipelineStatus === PipelineStatus.PURCHASE_AND_PRODUCTION_COMPLETED ||
      pipelineStatus === PipelineStatus.IN_OUTBOUND)
  );
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
