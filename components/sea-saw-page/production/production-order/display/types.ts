import { HeaderMetaProps } from "@/components/sea-saw-design/table/interface";
import type { FormDef } from "@/components/sea-saw-design/form/interface";

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
  /** Field definitions - accepts FormDef (auto-extracts child?.children) or pre-extracted Record */
  def?: FormDef | Record<string, HeaderMetaProps>;
  value?: ProductionItem[] | null;
}

export interface ProductionOrderDisplayProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate?: (res: any) => void;
  onUpdate?: (res: any) => void;
  /** Callback when a Pipeline is created/updated for this Production Order */
  onPipelineCreated?: (pipeline: any) => void;
  def?: any[];
  data?: Record<string, any> | null;
  /** Column order for display fields */
  columnOrder?: string[];
}

export interface ProductionOrder {
  id?: number;
  pk?: number;
  production_code?: string;
  status?: string;
  status_display?: string;
  planned_date?: string;
  start_date?: string;
  end_date?: string;
  planned_qty?: string | number;
  produced_qty?: string | number;
  comment?: string;
  production_items?: ProductionItem[];
  attachments?: any[];
  related_order?: any;
  related_pipeline?: any;
  owner?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface ProductionOrderCardProps {
  def?: any[];
  value?: ProductionOrder[] | ProductionOrder | null;
  onItemClick?: (index: number) => void;
  orderStatus?: string;
  activeEntity?: string;
  hideEmptyFields?: boolean;
}
