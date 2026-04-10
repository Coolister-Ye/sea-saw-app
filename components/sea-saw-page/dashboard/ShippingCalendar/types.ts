export type ShippingStatus =
  | "on_time"
  | "shipped_late"
  | "pending"
  | "overdue"
  | "no_pipeline";

export type OrderEntry = {
  order_id: number;
  order_code: string;
  account_name: string;
  etd: string;
  eta: string | null;
  order_status: string;
  pipeline_id: number | null;
  pipeline_code: string | null;
  pipeline_status: string | null;
  shipping_status: ShippingStatus;
  outbound_date: string | null;
  total_amount: string;
};

export type EtaOrderEntry = {
  order_id: number;
  order_code: string;
  account_name: string;
  etd: string;
  eta: string;
  outbound_code: string;
  outbound_status: string;
  pipeline_id: number;
  pipeline_code: string;
  pipeline_status: string | null;
};

export type ShippingCalendarData = {
  year: number;
  month: number;
  etd: {
    summary: {
      total: number;
      on_time: number;
      shipped_late: number;
      outbound_completed: number;
      pending: number;
      overdue: number;
      no_pipeline: number;
    };
    orders_by_date: Record<string, OrderEntry[]>;
  };
  eta: {
    summary: {
      total: number;
      completed: number;
      overdue: number;
      pending: number;
    };
    orders_by_date: Record<string, EtaOrderEntry[]>;
  };
};

export type SummaryKey = keyof ShippingCalendarData["etd"]["summary"];

export const TAG_COLOR: Record<
  ShippingStatus,
  "green" | "orange" | "blue" | "red" | "grey"
> = {
  on_time: "green",
  shipped_late: "orange",
  pending: "blue",
  overdue: "red",
  no_pipeline: "grey",
};

/** Values are i18n keys — call i18n.t(STATUS_LABEL[s]) at render time. */
export const STATUS_LABEL: Record<ShippingStatus, string> = {
  on_time: "On Time",
  shipped_late: "Shipped Late",
  pending: "Pending Shipment",
  overdue: "ETD Overdue",
  no_pipeline: "No Pipeline",
};

// ── ETA status ───────────────────────────────────────────────────────────────

export type EtaStatus = "completed" | "overdue" | "pending";

/** Values are i18n keys — call i18n.t(ETA_STATUS_LABEL[s]) at render time. */
export const ETA_STATUS_LABEL: Record<EtaStatus, string> = {
  completed: "completed",
  overdue: "ETA Overdue",
  pending: "Expected Arrival",
};

export const ETA_TAG_COLOR: Record<
  EtaStatus,
  { etaClassName: string; badge: string }
> = {
  completed: {
    etaClassName: "text-green-600 dark:text-green-400",
    badge: "green",
  },
  overdue: { etaClassName: "text-red-500", badge: "red" },
  pending: {
    etaClassName: "text-purple-600 dark:text-purple-400",
    badge: "blue",
  },
};

/**
 * Derive ETA status from pipeline state + elapsed days since ETA.
 * - completed: pipeline reached "completed"
 * - overdue: 25+ days past ETA, still not completed → user should update pipeline
 * - pending: within 25 days, not yet completed
 */
export function getEtaStatus(
  eta: string,
  pipelineStatus: string | null,
): EtaStatus {
  if (pipelineStatus === "completed") return "completed";
  const daysPastEta = Math.floor(
    (Date.now() - new Date(eta).getTime()) / 86_400_000,
  );
  return daysPastEta >= 25 ? "overdue" : "pending";
}

// ── Tag styles ────────────────────────────────────────────────────────────────

export const ORDER_TAG_STYLE = {
  cursor: "pointer" as const,
  marginBottom: 2,
  overflow: "hidden",
  flexShrink: 0,
  width: "100%",
};

export const ORDER_TAG_LABEL_STYLE = {
  fontSize: 11,
  textOverflow: "ellipsis" as const,
  whiteSpace: "nowrap" as const,
};

/** label values are i18n keys — pass through i18n.t() before rendering. */
export const SUMMARY_CARDS: {
  label: string;
  key: SummaryKey;
  colorClass: string;
}[] = [
  { label: "Monthly Orders", key: "total", colorClass: "text-foreground" },
  { label: "On Time", key: "on_time", colorClass: "text-green-500" },
  { label: "Shipped Late", key: "shipped_late", colorClass: "text-orange-500" },
  { label: "ETD Overdue", key: "overdue", colorClass: "text-red-500" },
  { label: "Pending Shipment", key: "pending", colorClass: "text-blue-500" },
];

/** label values are i18n keys — pass through i18n.t() before rendering. */
export const ETA_SUMMARY_CARDS: {
  label: string;
  key: EtaStatus | "total";
  colorClass: string;
}[] = [
  { label: "Monthly ETA", key: "total", colorClass: "text-foreground" },
  { label: "completed", key: "completed", colorClass: "text-green-500" },
  { label: "ETA Overdue", key: "overdue", colorClass: "text-red-500" },
  { label: "Pending Arrival", key: "pending", colorClass: "text-purple-500" },
];
