import { HeaderMetaProps } from "@/components/sea-saw-design/table/interface";

export interface OutboundItem {
  id?: number;
  product_name?: string;
  specification?: string;
  outter_packaging?: string;
  inner_packaging?: string;
  size?: string;
  unit?: string;
  glazing?: string;
  gross_weight?: string;
  net_weight?: string;
  order_qty?: string;
  total_gross_weight?: string;
  total_net_weight?: string;
  outbound_qty?: string | number;
  outbound_net_weight?: string | number;
  outbound_gross_weight?: string | number;
}

export interface OutboundItemsDisplayProps {
  /** Field definitions (already extracted as child?.children from parent) */
  def?: Record<string, HeaderMetaProps>;
  value?: OutboundItem[] | null;
}

export interface OutboundOrderDisplayProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate?: (res: any) => void;
  onUpdate?: (res: any) => void;
  /** Callback when a Pipeline is created/updated for this Outbound Order */
  onPipelineCreated?: (pipeline: any) => void;
  def?: any[];
  data?: Record<string, any> | null;
  /** Column order for display fields */
  columnOrder?: string[];
}

export interface OutboundOrder {
  id?: number;
  pk?: number;
  outbound_code?: string;
  status?: string;
  status_display?: string;
  outbound_date?: string;
  destination?: string;
  comment?: string;
  outbound_items?: OutboundItem[];
  attachments?: any[];
  related_pipeline?: any;
  owner?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface OutboundOrderCardProps {
  def?: any[];
  value?: OutboundOrder[] | OutboundOrder | null;
  onItemClick?: (index: number) => void;
  orderStatus?: string;
  activeEntity?: string;
  hideEmptyFields?: boolean;
}
