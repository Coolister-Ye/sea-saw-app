import React, { memo } from "react";
import type { CustomCellRendererProps } from "ag-grid-react";
import PaymentPopover from "../display/PaymentPopover";

interface Payment {
  id?: string | number;
  [key: string]: any;
}

function PaymentsRender(props: CustomCellRendererProps<Payment[]>) {
  const payments = Array.isArray(props.value) ? props.value : [];
  const meta = props.context?.meta;
  const def = meta?.payments?.child?.children;

  if (payments.length === 0) return null;

  return (
    <>
      {payments.map((item, index) =>
        item ? (
          <PaymentPopover key={item.id ?? index} value={item} def={def} />
        ) : null
      )}
    </>
  );
}

export default memo(PaymentsRender);
export { PaymentsRender };
