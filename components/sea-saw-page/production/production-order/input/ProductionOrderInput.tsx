import React from "react";
import ProductionOrderInputStandalone from "./standalone/ProductionOrderInput";
import ProductionOrderInputNested from "./nested/ProductionOrderInput";

interface ProductionOrderInputProps {
  mode: "nested" | "standalone";
  isOpen: boolean;
  onClose: (res?: any) => void;
  onCreate?: (res?: any) => void;
  onUpdate?: (res?: any) => void;
  def: any;
  data?: {
    id?: string | number;
    [key: string]: any;
  };
  pipelineId?: string | number;
}

/**
 * Wrapper component for backward compatibility with mode prop.
 * Routes to standalone or nested implementation based on mode.
 */
export default function ProductionOrderInput({
  mode,
  ...props
}: ProductionOrderInputProps) {
  if (mode === "nested") {
    return <ProductionOrderInputNested {...props} />;
  }
  return <ProductionOrderInputStandalone {...props} />;
}
