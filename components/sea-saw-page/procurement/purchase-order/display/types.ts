import { HeaderMetaProps } from "@/components/sea-saw-design/table/interface";

export interface PurchaseItem {
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
  unit_price?: string;
  total_price?: string;
}

export interface PurchaseItemsDisplayProps {
  /** Field definitions (already extracted as child?.children from parent) */
  def?: Record<string, HeaderMetaProps>;
  value?: PurchaseItem[] | null;
}
