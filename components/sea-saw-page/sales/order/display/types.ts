export interface OrderDisplayProps {
  isOpen: boolean;
  onClose: () => void;
  onEditOrder?: (order: any) => void;
  onEditProductionOrder?: (prod: any) => void;
  onEditOutboundOrder?: (ob: any) => void;
  onEditPayment?: (payment: any) => void;
  onCreate?: (res: any) => void;
  onUpdate?: (res: any) => void;
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

export interface OrderSectionProps {
  order: any;
  orderStatus: string;
  defs: OrderDefs;
  displayConfig: any;
  editingOrder: any | null;
  setEditingOrder: (order: any | null) => void;
  onCreate?: (res: any) => void;
  onUpdate?: (res: any) => void;
}

export interface ProductionOrdersSectionProps {
  order: any;
  orderStatus: string;
  productionOrders: any[];
  defs: OrderDefs;
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
  defs: OrderDefs;
  displayConfig?: any;
  optionState: string[];
  editingOb: any | null;
  setEditingOb: (ob: any | null) => void;
  onCreate?: (res: any) => void;
  onUpdate?: (res: any) => void;
}

export interface PaymentsSectionProps {
  order: any;
  orderStatus: string;
  payments: any[];
  defs: OrderDefs;
  editingPayment: any | null;
  setEditingPayment: (payment: any | null) => void;
  onCreate?: (res: any) => void;
  onUpdate?: (res: any) => void;
}

export interface PurchaseOrdersSectionProps {
  order: any;
  orderStatus: string;
  purchaseOrders: any[];
  defs: OrderDefs;
  displayConfig: any;
  optionState: string[];
  editingPurchase: any | null;
  setEditingPurchase: (purchase: any | null) => void;
  onCreate?: (res: any) => void;
  onUpdate?: (res: any) => void;
}
