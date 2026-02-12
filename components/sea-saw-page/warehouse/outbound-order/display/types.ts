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
