import React, { useMemo } from "react";
import "@/css/tableStyle.css";
import { View } from "react-native";

import { useCRMPage } from "@/hooks/useCRMPage";
import { CRMPageLoading } from "@/components/sea-saw-page/crm/common/CRMPageLoading";

import Table from "@/components/sea-saw-design/table";
import { theme } from "@/components/sea-saw-design/table/theme";

import ContactRender from "@/components/sea-saw-page/crm/table/render/ContactRender";
import OrderItemsRender from "@/components/sea-saw-page/crm/table/render/OrderItemsRender";
import ProductionOrderRender from "@/components/sea-saw-page/crm/table/render/ProductionOrderRender";
import PurchaseOrderRender from "@/components/sea-saw-page/crm/table/render/PurchaseOrderRender";
import OutboundOrdersRender from "@/components/sea-saw-page/crm/table/render/OutboundOrdersRender";
import PaymentsRender from "@/components/sea-saw-page/crm/table/render/PaymentsRender";
import AttachmentsRender from "@/components/sea-saw-page/crm/table/render/AttachmentsRender";
import OrderStatusRender from "@/components/sea-saw-page/crm/table/render/OrderStatusRender";

import { OrderInput } from "@/components/sea-saw-page/crm/from/input/order";
import { OrderDisplay } from "@/components/sea-saw-page/crm/from/display/order";
import ActionDropdown from "@/components/sea-saw-page/crm/common/ActionDropdown";

export default function OrderScreen() {
  const {
    loadingMeta,
    metaError,
    headerMeta,
    formDefs,
    isEditOpen,
    isViewOpen,
    viewRow,
    editData,
    copyDisabled,
    openCreate,
    openCopy,
    closeView,
    closeEdit,
    handleCreateSuccess,
    handleUpdateSuccess,
    tableRef,
    tableProps,
  } = useCRMPage({
    entity: "order",
    nameField: "order_number",
    excludeFromCopy: [
      "production_orders",
      "purchase_orders",
      "outbound_orders",
      "payments",
    ],
    filterMetaFields: ["allowed_actions"],
  });

  /* ================= Defs 拆分 ================= */
  const defs = useMemo(() => {
    const pick = (field: string) => formDefs.find((d) => d.field === field);

    return {
      base: formDefs.filter(
        (d) =>
          ![
            "production_orders",
            "purchase_orders",
            "outbound_orders",
            "payments",
            "allowed_actions",
          ].includes(d.field)
      ),
      productionOrders: pick("production_orders"),
      purchaseOrders: pick("purchase_orders"),
      outboundOrders: pick("outbound_orders"),
      payments: pick("payments"),
    };
  }, [formDefs]);

  /* ================= Column Renderers ================= */
  const colRenderers = useMemo(
    () => ({
      contact: { cellRenderer: ContactRender },
      contact_id: { hide: true },
      order_items: { cellRenderer: OrderItemsRender },
      production_orders: { cellRenderer: ProductionOrderRender },
      purchase_orders: { cellRenderer: PurchaseOrderRender },
      outbound_orders: { cellRenderer: OutboundOrdersRender },
      payments: { cellRenderer: PaymentsRender },
      attachments: { cellRenderer: AttachmentsRender },
      status: { cellRenderer: OrderStatusRender },
    }),
    []
  );

  return (
    <CRMPageLoading loading={loadingMeta} error={metaError}>
      <View className="flex-1 bg-white">
        {/* Top Actions */}
        <View className="flex-row justify-end gap-1 p-1 py-1.5">
          <ActionDropdown
            openCreate={openCreate}
            openCopy={openCopy}
            copyDisabled={copyDisabled}
          />
        </View>

        {/* Create / Copy Drawer */}
        <OrderInput
          mode="standalone"
          isOpen={isEditOpen}
          def={defs.base}
          data={editData}
          onClose={closeEdit}
          onCreate={handleCreateSuccess}
          onUpdate={handleUpdateSuccess}
        />

        {/* View Drawer */}
        <OrderDisplay
          isOpen={isViewOpen}
          def={formDefs}
          data={viewRow}
          onClose={closeView}
          onCreate={handleCreateSuccess}
          onUpdate={handleUpdateSuccess}
        />

        {/* Table */}
        <Table
          ref={tableRef}
          table="order"
          headerMeta={headerMeta}
          theme={theme}
          colDefinitions={colRenderers}
          context={{ meta: headerMeta }}
          rowSelection={{ mode: "singleRow" }}
          {...tableProps}
        />
      </View>
    </CRMPageLoading>
  );
}
