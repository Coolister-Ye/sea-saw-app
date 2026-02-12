import React, { useMemo } from "react";
import "@/css/tableStyle.css";
import { View } from "react-native";

import { useEntityPage } from "@/hooks/useEntityPage";
import { PageLoading } from "@/components/sea-saw-page/base/PageLoading";
import { pickFormDef, filterFormDefs } from "@/utils/formDefUtils";

import Table from "@/components/sea-saw-design/table";
import { theme } from "@/components/sea-saw-design/table/theme";

import AccountCell from "@/components/sea-saw-page/crm/account/table/AccountCell";
import ContactCell from "@/components/sea-saw-page/crm/contact/table/ContactCell";
import OrdersRender from "@/components/sea-saw-page/sales/order/table/OrdersRender";
import ProductionOrderRender from "@/components/sea-saw-page/production/production-order/table/ProductionOrderRender";
import PurchaseOrderRender from "@/components/sea-saw-page/procurement/purchase-order/table/PurchaseOrderRender";
import OutboundOrdersRender from "@/components/sea-saw-page/warehouse/outbound-order/table/OutboundOrdersRender";
import PaymentsRender from "@/components/sea-saw-page/finance/payment/table/PaymentsRender";
import PipelineStatusRender from "@/components/sea-saw-page/pipeline/table/PipelineStatusCell";

import ActionDropdown from "@/components/sea-saw-design/action-dropdown";
import PipelineInput from "@/components/sea-saw-page/pipeline/input/standalone/PipelineInput";
import PipelineDisplay from "@/components/sea-saw-page/pipeline/display/PipelineDisplay";
import type { PipelineDefs } from "@/components/sea-saw-page/pipeline/display/types";

const EXCLUDED_FIELDS = [
  "order",
  "production_orders",
  "purchase_orders",
  "outbound_orders",
  "payments",
  "allowed_actions",
] as const;

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
      "order",
      "production_orders",
      "purchase_orders",
      "outbound_orders",
      "payments",
    ],
    filterMetaFields: ["allowed_actions"],
  });

  // Categorize defs once - no duplicate transformations
  const categorizedDefs = useMemo((): PipelineDefs => {
    return {
      base: filterFormDefs(formDefs, [...EXCLUDED_FIELDS]),
      orders: pickFormDef(formDefs, "order"),
      productionOrders: pickFormDef(formDefs, "production_orders"),
      purchaseOrders: pickFormDef(formDefs, "purchase_orders"),
      outboundOrders: pickFormDef(formDefs, "outbound_orders"),
      payments: pickFormDef(formDefs, "payments"),
    };
  }, [formDefs]);

  console.log("categorizedDefs", categorizedDefs);

  const colRenderers = useMemo(
    () => ({
      active_entity: { hide: true },
      company: { cellRenderer: AccountCell },
      contact: { cellRenderer: ContactCell },
      status: { cellRenderer: PipelineStatusRender },
      order: { cellRenderer: OrdersRender },
      purchase_orders: { cellRenderer: PurchaseOrderRender },
      production_orders: { cellRenderer: ProductionOrderRender },
      outbound_orders: { cellRenderer: OutboundOrdersRender },
      payments: { cellRenderer: PaymentsRender },
    }),
    [],
  );

  return (
    <PageLoading loading={loadingMeta} error={metaError}>
      <View className="flex-1 bg-white">
        {/* Top Actions */}
        <View className="flex-row justify-end gap-1 p-1 py-3">
          <ActionDropdown
            onPrimaryAction={openCreate}
            onCopy={openCopy}
            copyDisabled={copyDisabled}
          />
        </View>

        {/* Create / Copy Drawer */}
        <PipelineInput
          isOpen={isEditOpen}
          def={categorizedDefs.base}
          data={editData}
          onClose={closeEdit}
          onCreate={handleCreateSuccess}
          onUpdate={handleUpdateSuccess}
        />

        {/* View Drawer */}
        <PipelineDisplay
          isOpen={isViewOpen}
          defs={categorizedDefs}
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
          hideWriteOnly={true}
          {...tableProps}
        />
      </View>
    </PageLoading>
  );
}
