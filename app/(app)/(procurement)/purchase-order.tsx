import React, { useMemo } from "react";
import i18n from "@/locale/i18n";
import "@/css/tableStyle.css";
import { View } from "react-native";

import { Button } from "@/components/sea-saw-design/button";
import { Text } from "@/components/sea-saw-design/text";
import { useEntityPage } from "@/hooks/useEntityPage";
import { PageLoading } from "@/components/sea-saw-page/base/PageLoading";

import Table from "@/components/sea-saw-design/table";
import { theme } from "@/components/sea-saw-design/table/theme";
import PurchaseOrderInput from "@/components/sea-saw-page/procurement/purchase-order/input/PurchaseOrderInput";
import PurchaseOrderDisplay from "@/components/sea-saw-page/procurement/purchase-order/display/PurchaseOrderDisplay";

export default function PurchaseOrderScreen() {
  const {
    loadingMeta,
    metaError,
    headerMeta,
    formDefs,
    isEditOpen,
    isViewOpen,
    viewRow,
    editData,
    openCreate,
    openCopy,
    closeView,
    closeEdit,
    handleCreateSuccess,
    handleUpdateSuccess,
    tableRef,
    tableProps,
  } = useEntityPage({
    entity: "purchaseOrder",
    nameField: "purchase_code",
    excludeFromCopy: ["related_pipeline"],
  });

  const baseDefs = useMemo(
    () => formDefs.filter((d) => d.field !== "allowed_actions"),
    [formDefs],
  );

  return (
    <PageLoading loading={loadingMeta} error={metaError}>
      <View className="flex-1 bg-white">
        {/* Top Actions */}
        <View className="p-2 flex-row justify-end gap-2">
          <Button onPress={openCreate}>
            <Text>{i18n.t("create")}</Text>
          </Button>
          <Button onPress={openCopy}>
            <Text>{i18n.t("copy")}</Text>
          </Button>
        </View>

        {/* Create / Copy Drawer */}
        <PurchaseOrderInput
          mode="standalone"
          isOpen={isEditOpen}
          def={baseDefs}
          data={editData}
          onClose={closeEdit}
          onCreate={handleCreateSuccess}
          onUpdate={handleUpdateSuccess}
        />

        {/* View Drawer */}
        <PurchaseOrderDisplay
          isOpen={isViewOpen}
          def={baseDefs}
          data={viewRow}
          onClose={closeView}
          onUpdate={handleUpdateSuccess}
        />

        {/* Table */}
        <Table
          ref={tableRef}
          table="purchaseOrder"
          headerMeta={headerMeta}
          theme={theme}
          context={{ meta: headerMeta }}
          rowSelection={{ mode: "singleRow" }}
          {...tableProps}
        />
      </View>
    </PageLoading>
  );
}
