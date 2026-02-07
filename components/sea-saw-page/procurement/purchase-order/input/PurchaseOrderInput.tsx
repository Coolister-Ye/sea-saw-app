import React from "react";
import PurchaseOrderInputStandalone from "./standalone/PurchaseOrderInput";
import PurchaseOrderInputNested from "./nested/PurchaseOrderInput";

interface PurchaseOrderInputProps {
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
  orderId?: string | number;
}

/**
 * Wrapper component for backward compatibility with mode prop.
 * Routes to standalone or nested implementation based on mode.
 */
export default function PurchaseOrderInput({
  mode,
  ...props
}: PurchaseOrderInputProps) {
  if (mode === "nested") {
    return <PurchaseOrderInputNested {...props} />;
  }
  return <PurchaseOrderInputStandalone {...props} />;
}
