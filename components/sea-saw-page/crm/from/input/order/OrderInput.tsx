import React from "react";
import OrderInputStandalone from "./standalone/OrderInput";
import OrderInputNested from "./nested/OrderInput";

interface OrderInputProps {
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
export default function OrderInput({
  mode,
  ...props
}: OrderInputProps) {
  if (mode === "nested") {
    return <OrderInputNested {...props} />;
  }
  return <OrderInputStandalone {...props} />;
}
