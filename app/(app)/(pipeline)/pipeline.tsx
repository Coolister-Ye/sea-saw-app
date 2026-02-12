import React, { useMemo } from "react";
import "@/css/tableStyle.css";
import { View } from "react-native";

import { useEntityPage } from "@/hooks/useEntityPage";
import { PageLoading } from "@/components/sea-saw-page/base/PageLoading";

import Table from "@/components/sea-saw-design/table";
import { theme } from "@/components/sea-saw-design/table/theme";

import ContactCell from "@/components/sea-saw-page/crm/contact/table/ContactCell";
import AttachmentsRender from "@/components/sea-saw-page/base/table/AttachmentsRender";
import OrdersRender from "@/components/sea-saw-page/sales/order/table/OrdersRender";
import ProductionOrderRender from "@/components/sea-saw-page/production/production-order/table/ProductionOrderRender";
import PurchaseOrderRender from "@/components/sea-saw-page/procurement/purchase-order/table/PurchaseOrderRender";
import OutboundOrdersRender from "@/components/sea-saw-page/warehouse/outbound-order/table/OutboundOrdersRender";
import PaymentsRender from "@/components/sea-saw-page/finance/payment/table/PaymentsRender";
import PipelineStatusRender from "@/components/sea-saw-page/pipeline/table/PipelineStatusCell";

import ActionDropdown from "@/components/sea-saw-design/action-dropdown";
import PipelineInput from "@/components/sea-saw-page/pipeline/input/standalone/PipelineInput";
import PipelineDisplay from "@/components/sea-saw-page/pipeline/display/PipelineDisplay";

export default function PipelineScreen() {
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
  } = useEntityPage({
    entity: "pipeline",
    nameField: "name",
    excludeFromCopy: [
      "orders",
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
            "orders",
            "production_orders",
            "purchase_orders",
            "outbound_orders",
            "payments",
            "allowed_actions",
          ].includes(d.field),
      ),
      orders: pick("orders"),
      productionOrders: pick("production_orders"),
      purchaseOrders: pick("purchase_orders"),
      outboundOrders: pick("outbound_orders"),
      payments: pick("payments"),
    };
  }, [formDefs]);

  /* ================= Column Renderers ================= */
  const colRenderers = useMemo(
    () => ({
      contact: { cellRenderer: ContactCell },
      contact_id: { hide: true },
      active_entity: { hide: true },
      status: { cellRenderer: PipelineStatusRender },
      attachments: { cellRenderer: AttachmentsRender },
      orders: { cellRenderer: OrdersRender },
      production_orders: { cellRenderer: ProductionOrderRender },
      purchase_orders: { cellRenderer: PurchaseOrderRender },
      outbound_orders: { cellRenderer: OutboundOrdersRender },
      payments: { cellRenderer: PaymentsRender },
    }),
    [],
  );

  return (
    <PageLoading loading={loadingMeta} error={metaError}>
      <View className="flex-1 bg-white">
        {/* Top Actions */}
        <View className="flex-row justify-end gap-1 p-1 py-1.5">
          <ActionDropdown
            onPrimaryAction={openCreate}
            onCopy={openCopy}
            copyDisabled={copyDisabled}
          />
        </View>

        {/* Create / Copy Drawer */}
        <PipelineInput
          isOpen={isEditOpen}
          def={defs.base}
          data={editData}
          onClose={closeEdit}
          onCreate={handleCreateSuccess}
          onUpdate={handleUpdateSuccess}
        />

        {/* View Drawer */}
        <PipelineDisplay
          isOpen={isViewOpen}
          defs={defs}
          data={viewRow}
          onClose={closeView}
          onCreate={handleCreateSuccess}
          onUpdate={handleUpdateSuccess}
        />

        {/* Table */}
        <Table
          ref={tableRef}
          table="pipeline"
          headerMeta={headerMeta}
          theme={theme}
          colDefinitions={colRenderers}
          context={{ meta: headerMeta }}
          rowSelection={{ mode: "singleRow" }}
          {...tableProps}
        />
      </View>
    </PageLoading>
  );
}
