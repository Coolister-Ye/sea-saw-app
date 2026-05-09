import React, { forwardRef, useMemo } from "react";

import { GridTable } from "@/components/sea-saw-design/table/GridTable";
import type { GridTableProps } from "@/components/sea-saw-design/table/GridTable";
import type { GridRef, CellRendererProps } from "@/components/sea-saw-design/grid";

import AccountCell from "@/components/sea-saw-page/crm/account/table/AccountCell";
import ContactCell from "@/components/sea-saw-page/crm/contact/table/ContactCell";
import { BankAccountPopover } from "@/components/sea-saw-page/crm/bank-account/display";
import OrderItemsCell from "@/components/sea-saw-page/sales/order/table/OrderItemsCell";
import AttachmentsRender from "@/components/sea-saw-page/base/table/AttachmentsRender";
import OrderStatusCell from "@/components/sea-saw-page/sales/order/table/OrderStatusCell";
import PipelineCell from "@/components/sea-saw-page/pipeline/table/PipelineCell";

/* Existing cell renderers type-check against ag-grid's CustomCellRendererProps, but
   they only access { value, context } which Grid's CellRendererProps also provides. */
type AnyCell = (props: CellRendererProps) => React.ReactNode;

const COL_DEFINITIONS: GridTableProps["colDefinitions"] = {
  order_code: { width: 200 },
  buyer: { cellRenderer: AccountCell as unknown as AnyCell },
  seller: { cellRenderer: AccountCell as unknown as AnyCell },
  shipper: { cellRenderer: AccountCell as unknown as AnyCell },
  contact: { cellRenderer: ContactCell as unknown as AnyCell },
  bank_account: {
    cellRenderer: (({ value, context }: CellRendererProps) => (
      <BankAccountPopover
        value={value ?? {}}
        def={context?.meta?.bank_account?.children}
      />
    )) as AnyCell,
  },
  order_items: { cellRenderer: OrderItemsCell as unknown as AnyCell, width: 200 },
  attachments: { cellRenderer: AttachmentsRender as unknown as AnyCell },
  status: { cellRenderer: OrderStatusCell as unknown as AnyCell },
  related_pipeline: { cellRenderer: PipelineCell as unknown as AnyCell, width: 200 },
};

type OrderGridTableProps = Omit<GridTableProps, "colDefinitions" | "context">;

const OrderGridTable = forwardRef<GridRef, OrderGridTableProps>(
  function OrderGridTable({ headerMeta, ...rest }, ref) {
    const context = useMemo(() => ({ meta: headerMeta }), [headerMeta]);

    return (
      <GridTable
        ref={ref}
        colDefinitions={COL_DEFINITIONS}
        context={context}
        rowSelection={{ mode: "multiRow" }}
        hideWriteOnly
        headerMeta={headerMeta}
        {...rest}
      />
    );
  },
);

export default OrderGridTable;
export { OrderGridTable };
