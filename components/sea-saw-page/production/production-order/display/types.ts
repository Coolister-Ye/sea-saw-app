import { HeaderMetaProps } from "@/components/sea-saw-design/table/interface";

export interface ProductionItem {
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
  planned_qty?: string | number;
  produced_qty?: string | number;
}

export interface ProductionItemsDisplayProps {
  /** Field definitions (already extracted as child?.children from parent) */
  def?: Record<string, HeaderMetaProps>;
  value?: ProductionItem[] | null;
}
