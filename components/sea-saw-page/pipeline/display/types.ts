import type { FormDef } from "@/hooks/useFormDefs";

export interface PipelineDisplayProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate?: (res?: any) => void;
  onUpdate?: (res?: any) => void;
  defs: PipelineDefs;
  data?: any;
}

export interface PipelineDefs {
  base: FormDef[];
  orders?: FormDef;
  productionOrders?: FormDef;
  purchaseOrders?: FormDef;
  outboundOrders?: FormDef;
  payments?: FormDef;
}

export interface PipelineSectionProps {
  pipeline: any;
  def: any[];
  displayConfig: any;
  editingPipeline: any | null;
  setEditingPipeline: (data: any | null) => void;
  onCreate?: (res?: any) => void;
  onUpdate?: (res?: any) => void;
}
