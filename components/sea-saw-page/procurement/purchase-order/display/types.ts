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

export interface PurchaseOrderDisplayProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate?: (res: any) => void;
  onUpdate?: (res: any) => void;
  /** Callback when a Pipeline is created/updated for this Purchase Order */
  onPipelineCreated?: (pipeline: any) => void;
  def?: any[];
  data?: Record<string, any> | null;
  /** Column order for display fields */
  columnOrder?: string[];
}

export interface PurchaseOrder {
  id?: number;
  pk?: number;
  purchase_code?: string;
  status?: string;
  status_display?: string;
  supplier?: any;
  supplier_id?: number;
  contact?: any;
  contact_id?: number;
  purchase_date?: string;
  etd?: string;
  currency?: string;
  inco_terms?: string;
  deposit?: string | number;
  balance?: string | number;
  total_amount?: string | number;
  loading_port?: string;
  destination_port?: string;
  shipment_term?: string;
  comment?: string;
  purchase_items?: PurchaseItem[];
  attachments?: any[];
  related_pipeline?: any;
  related_order?: any;
  owner?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface PurchaseOrderCardProps {
  def?: any[];
  value?: PurchaseOrder[] | PurchaseOrder | null;
  onItemClick?: (index: number) => void;
  orderStatus?: string;
  activeEntity?: string;
  hideEmptyFields?: boolean;
}
