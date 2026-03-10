export interface OrderDisplayProps {
  isOpen: boolean;
  onClose: () => void;
  onEditOrder?: (order: any) => void;
  onCreate?: (res: any) => void;
  onUpdate?: (res: any) => void;
  /** Callback when a Pipeline is created for this Order */
  onPipelineCreated?: (pipeline: any) => void;
  /** Callback when a Pipeline is updated (e.g., status change) */
  onPipelineUpdate?: (pipeline: any) => void;
  def?: any[];
  data?: Record<string, any> | null;
}

export interface OrderDefs {
  base: any[];
  productionOrders: any;
  outboundOrders: any;
  payments: any;
  purchaseOrders: any;
}

export interface ProductionOrdersSectionProps {
  order: any;
  pipelineStatus: string;
  productionOrders: any[];
  def: any;
  displayConfig: any;
  optionState: string[];
  editingProd: any | null;
  setEditingProd: (prod: any | null) => void;
  onCreate?: (res: any) => void;
  onUpdate?: (res: any) => void;
}

export interface OutboundOrdersSectionProps {
  pipeline: any; // Pipeline object
  pipelineStatus: string; // Pipeline status
  outboundOrders: any[];
  def: any;
  displayConfig?: any;
  optionState: string[];
  editingOb: any | null;
  setEditingOb: (ob: any | null) => void;
  onCreate?: (res: any) => void;
  onUpdate?: (res: any) => void;
}

export interface PaymentsSectionProps {
  order: any;
  pipelineStatus: string;
  payments: any[];
  def: any;
  editingPayment: any | null;
  setEditingPayment: (payment: any | null) => void;
  onCreate?: (res: any) => void;
  onUpdate?: (res: any) => void;
}

export interface PurchaseOrdersSectionProps {
  order: any;
  pipelineStatus: string;
  purchaseOrders: any[];
  def: any;
  displayConfig: any;
  optionState: string[];
  editingPurchase: any | null;
  setEditingPurchase: (purchase: any | null) => void;
  onCreate?: (res: any) => void;
  onUpdate?: (res: any) => void;
}
