import React, { useMemo, forwardRef } from "react";
import { AgGridReact } from "ag-grid-react";

import Table from "@/components/sea-saw-design/table";
import { theme } from "@/components/sea-saw-design/table/theme";

import AttachmentsRender from "@/components/sea-saw-page/base/table/AttachmentsRender";
import OrderPopover from "@/components/sea-saw-page/sales/order/display/OrderPopover";
import ProductionItemsCell from "@/components/sea-saw-page/production/production-order/display/items/ProductionItemsCell";
import ProductionStatusRender from "@/components/sea-saw-page/production/production-order/table/ProductionStatusRender";

interface ProductionTableProps {
  headerMeta: Record<string, any>;
  onRowClicked?: (e: any) => void;
  [key: string]: any;
}

const ProductionTable = forwardRef<AgGridReact, ProductionTableProps>(
  ({ headerMeta, onRowClicked, ...restProps }, ref) => {
    const colRenderers = useMemo(
      () => ({
        production_code: { width: 200 },
        status: { cellRenderer: ProductionStatusRender },
        related_order: { cellRenderer: OrderPopover, width: 200 },
        production_items: { cellRenderer: ProductionItemsCell, width: 200 },
        attachments: { cellRenderer: AttachmentsRender },
      }),
      [],
    );

    return (
      <Table
        ref={ref}
        table="productionOrder"
        headerMeta={headerMeta}
        theme={theme}
        colDefinitions={colRenderers}
        context={{ meta: headerMeta }}
        rowSelection={{ mode: "singleRow" }}
        onRowClicked={onRowClicked}
        {...restProps}
      />
    );
  },
);

ProductionTable.displayName = "ProductionTable";

export default ProductionTable;
