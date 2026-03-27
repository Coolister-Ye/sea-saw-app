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

export type EtaWarningEntry = EtaOrderEntry & {
  days_until_eta: number;
};

export type ETDCalendarData = {
  year: number;
  month: number;
  orders_by_date: Record<string, OrderEntry[]>;
  summary: {
    total: number;
    on_time: number;
    shipped_late: number;
    pending: number;
    overdue: number;
    no_pipeline: number;
  };
  orders_by_eta_date: Record<string, EtaOrderEntry[]>;
  eta_warning_list: EtaWarningEntry[];
};

export type SummaryKey = keyof ETDCalendarData["summary"];

// antd color names used only for the order tags inside Tooltip (data display)
export const ANT_STATUS_COLOR: Record<ShippingStatus, string> = {
  on_time: "success",
  shipped_late: "warning",
  pending: "processing",
  overdue: "error",
  no_pipeline: "default",
};

// sea-saw-design Tag color names (used for legend)
export const TAG_COLOR: Record<ShippingStatus, "green" | "orange" | "blue" | "red" | "grey"> = {
  on_time: "green",
  shipped_late: "orange",
  pending: "blue",
  overdue: "red",
  no_pipeline: "grey",
};

export const STATUS_LABEL: Record<ShippingStatus, string> = {
  on_time: "准时发货",
  shipped_late: "延迟发货",
  pending: "待发货",
  overdue: "已逾期",
  no_pipeline: "无流程",
};

export const ORDER_TAG_STYLE: React.CSSProperties = {
  cursor: "pointer",
  fontSize: 11,
  marginBottom: 2,
  display: "block",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  flexShrink: 0,
};

export const SUMMARY_CARDS: { label: string; key: SummaryKey; colorClass: string }[] = [
  { label: "本月订单总数", key: "total", colorClass: "text-foreground" },
  { label: "准时发货", key: "on_time", colorClass: "text-green-500" },
  { label: "延迟发货", key: "shipped_late", colorClass: "text-orange-500" },
  { label: "已逾期未发", key: "overdue", colorClass: "text-red-500" },
  { label: "待发货", key: "pending", colorClass: "text-blue-500" },
];
