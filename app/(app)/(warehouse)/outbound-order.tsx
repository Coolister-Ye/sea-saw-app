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
import OutboundOrderInput from "@/components/sea-saw-page/warehouse/outbound-order/input/nested/OutboundOrderInput";
import StandaloneOutboundOrderDisplay from "@/components/sea-saw-page/warehouse/outbound-order/display/StandaloneOutboundOrderDisplay";

export default function OutboundOrderScreen() {
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
    closeView,
    closeEdit,
    handleCreateSuccess,
    handleUpdateSuccess,
    tableRef,
    tableProps,
  } = useEntityPage({
    entity: "outboundOrder",
    nameField: "outbound_code",
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
        </View>

        {/* Create Drawer */}
        <OutboundOrderInput
          mode="standalone"
          isOpen={isEditOpen}
          def={baseDefs}
          data={editData}
          onClose={closeEdit}
          onCreate={handleCreateSuccess}
          onUpdate={handleUpdateSuccess}
        />

        {/* View Drawer */}
        <StandaloneOutboundOrderDisplay
          isOpen={isViewOpen}
          def={baseDefs}
          data={viewRow}
          onClose={closeView}
          onUpdate={handleUpdateSuccess}
        />

        {/* Table */}
        <Table
          ref={tableRef}
          table="outboundOrder"
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
