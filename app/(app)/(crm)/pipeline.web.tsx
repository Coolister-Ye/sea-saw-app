import React, { useMemo } from "react";
import "@/css/tableStyle.css";
import { View } from "react-native";

import { useCRMPage } from "@/hooks/useCRMPage";
import { CRMPageLoading } from "@/components/sea-saw-page/crm/common/CRMPageLoading";

import Table from "@/components/sea-saw-design/table";
import { theme } from "@/components/sea-saw-design/table/theme";

import CompanyRender from "@/components/sea-saw-page/crm/table/render/CompanyRender";
import ContactRender from "@/components/sea-saw-page/crm/table/render/ContactRender";
import OrdersRender from "@/components/sea-saw-page/crm/table/render/OrdersRender";
import ProductionOrderRender from "@/components/sea-saw-page/crm/table/render/ProductionOrderRender";
import PurchaseOrderRender from "@/components/sea-saw-page/crm/table/render/PurchaseOrderRender";
import OutboundOrdersRender from "@/components/sea-saw-page/crm/table/render/OutboundOrdersRender";
import PaymentsRender from "@/components/sea-saw-page/crm/table/render/PaymentsRender";
import PipelineStatusRender from "@/components/sea-saw-page/crm/table/render/PipelineStatusRender";

import { PipelineInput } from "@/components/sea-saw-page/crm/from/input/pipeline";
import { PipelineDisplay } from "@/components/sea-saw-page/crm/from/display/pipeline";
import ActionDropdown from "@/components/sea-saw-design/action-dropdown";

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
  } = useCRMPage({
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
          ].includes(d.field)
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
      company: { cellRenderer: CompanyRender },
      company_id: { hide: true },
      contact: { cellRenderer: ContactRender },
      contact_id: { hide: true },
      active_entity: { hide: true },
      status: { cellRenderer: PipelineStatusRender },
      order: { cellRenderer: OrdersRender },
      purchase_orders: { cellRenderer: PurchaseOrderRender },
      production_orders: { cellRenderer: ProductionOrderRender },
      outbound_orders: { cellRenderer: OutboundOrdersRender },
      payments: { cellRenderer: PaymentsRender },
    }),
    []
  );

  return (
    <CRMPageLoading loading={loadingMeta} error={metaError}>
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
          def={defs.base}
          data={editData}
          onClose={closeEdit}
          onCreate={handleCreateSuccess}
          onUpdate={handleUpdateSuccess}
        />

        {/* View Drawer */}
        <PipelineDisplay
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
          table="pipeline"
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
