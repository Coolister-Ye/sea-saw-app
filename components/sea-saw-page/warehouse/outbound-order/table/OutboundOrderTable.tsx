import React, { useMemo, forwardRef } from "react";
import type { CustomCellRendererProps } from "ag-grid-react";
import { AgGridReact } from "ag-grid-react";

import Table from "@/components/sea-saw-design/table";
import { theme } from "@/components/sea-saw-design/table/theme";
import AttachmentsRender from "@/components/sea-saw-page/base/table/AttachmentsRender";
import PipelineCell from "@/components/sea-saw-page/pipeline/table/PipelineCell";
import { OutboundStatusRender } from "./OutboundStatusRender";
import { OutboundOrdersRender } from "./OutboundOrdersRender";

interface OutboundOrderTableProps {
  headerMeta: Record<string, any>;
  onRowClicked?: (e: any) => void;
  columnOrder?: string[];
  [key: string]: any;
}

const OutboundOrderTable = forwardRef<AgGridReact, OutboundOrderTableProps>(
  ({ headerMeta, onRowClicked, columnOrder, ...restProps }, ref) => {
    const colRenderers = useMemo(
      () => ({
        outbound_code: { width: 220 },
        status: { cellRenderer: OutboundStatusRender },
        related_pipeline: { cellRenderer: PipelineCell, width: 200 },
        outbound_items: {
          cellRenderer: (params: CustomCellRendererProps) => {
            const value = params.value ?? [];
            const def = params.context?.meta?.outbound_items?.child?.children;
            return (
              <OutboundOrdersRender
                {...params}
                value={Array.isArray(value) ? value : [value]}
                context={{ ...params.context, meta: { outbound_orders: { child: { children: def } } } }}
              />
            );
          },
          width: 200,
        },
        attachments: { cellRenderer: AttachmentsRender },
      }),
      [],
    );

    return (
      <Table
        ref={ref}
        table="outboundOrder"
        headerMeta={headerMeta}
        theme={theme}
        colDefinitions={colRenderers}
        context={{ meta: headerMeta }}
        rowSelection={{ mode: "multiRow" }}
        hideWriteOnly={true}
        onRowClicked={onRowClicked}
        columnOrder={columnOrder}
        {...restProps}
      />
    );
  },
);

OutboundOrderTable.displayName = "OutboundOrderTable";

export default OutboundOrderTable;
