export interface PipelineDisplayProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate?: (res?: any) => void;
  onUpdate?: (res?: any) => void;
  def?: any[];
  data?: any;
}

export interface PipelineDefs {
  base: any[];
  orders?: any;
  productionOrders: any;
  purchaseOrders: any;
  outboundOrders: any;
  payments: any;
}

export interface PipelineSectionProps {
  pipeline: any;
  defs: PipelineDefs;
  displayConfig: any;
  editingPipeline: any | null;
  setEditingPipeline: (data: any | null) => void;
  onCreate?: (res?: any) => void;
  onUpdate?: (res?: any) => void;
}
