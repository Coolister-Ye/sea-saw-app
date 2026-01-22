import React, { useMemo } from "react";
import "@/css/tableStyle.css";
import { View } from "react-native";

import { useCRMPage } from "@/hooks/useCRMPage";
import { CRMPageLoading } from "@/components/sea-saw-page/crm/common/CRMPageLoading";
import { stripIdsDeep } from "@/utils";

import Table from "@/components/sea-saw-design/table";
import { myTableTheme } from "@/components/sea-saw-design/table/theme";

import { ProductionOrderInput } from "@/components/sea-saw-page/crm/from/input/production";
import {
  ProductionOrderDisplay,
  ProductionItemsCell,
} from "@/components/sea-saw-page/crm/from/display/production";
import { OrderPopover } from "@/components/sea-saw-page/crm/from/display/order";
import ActionDropdown from "@/components/sea-saw-design/action-dropdown";
import ProductionStatusRender from "@/components/sea-saw-page/crm/table/render/ProductionStatusRender";
import AttachmentsRender from "@/components/sea-saw-page/crm/table/render/AttachmentsRender";

/** Production 的自定义 copy 逻辑 - 排除 production_code */
function buildProductionCopyData(productionOrder: any) {
  if (!productionOrder) return null;
  const { id, pk, production_code, created_at, updated_at, ...rest } =
    productionOrder;
  return stripIdsDeep(rest);
}

export default function ProductionScreen() {
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
    entity: "productionOrder",
    nameField: "production_code",
    buildCopyData: buildProductionCopyData,
  });

  /* ================= Column Renderers ================= */
  const colRenderers = useMemo(
    () => ({
      status: { cellRenderer: ProductionStatusRender },
      related_order: {
        cellRenderer: (params: any) => <OrderPopover value={params.value} />,
      },
      production_items: {
        cellRenderer: (params: any) => (
          <ProductionItemsCell value={params.value} />
        ),
      },
      attachments: { cellRenderer: AttachmentsRender },
    }),
    []
  );

  return (
    <CRMPageLoading loading={loadingMeta} error={metaError}>
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
        <ProductionOrderInput
          mode="standalone"
          isOpen={isEditOpen}
          def={formDefs}
          data={editData}
          onClose={closeEdit}
          onCreate={handleCreateSuccess}
          onUpdate={handleUpdateSuccess}
        />

        {/* View Drawer */}
        <ProductionOrderDisplay
          isOpen={isViewOpen}
          def={formDefs}
          data={viewRow}
          onClose={closeView}
          onUpdate={handleUpdateSuccess}
        />

        {/* Table */}
        <Table
          ref={tableRef}
          table="productionOrder"
          headerMeta={headerMeta}
          colDefinitions={colRenderers}
          theme={myTableTheme}
          context={{ meta: headerMeta }}
          rowSelection={{ mode: "singleRow" }}
          {...tableProps}
        />
      </View>
    </CRMPageLoading>
  );
}
