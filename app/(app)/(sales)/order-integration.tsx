import React, { useMemo } from "react";
import "@/css/tableStyle.css";
import { View } from "react-native";

import { useEntityPage } from "@/hooks/useEntityPage";
import { PageLoading } from "@/components/sea-saw-page/base/PageLoading";

import Table from "@/components/sea-saw-design/table";
import { theme } from "@/components/sea-saw-design/table/theme";
import OrderDisplay from "@/components/sea-saw-page/sales/order/display/OrderDisplay";

export default function OrderIntegrationScreen() {
  const {
    loadingMeta,
    metaError,
    headerMeta,
    formDefs,
    isViewOpen,
    viewRow,
    closeView,
    handleUpdateSuccess,
    tableRef,
    tableProps,
  } = useEntityPage({
    entity: "orderIntegration",
    nameField: "order_code",
  });

  return (
    <PageLoading loading={loadingMeta} error={metaError}>
      <View className="flex-1 bg-white">
        <OrderDisplay
          isOpen={isViewOpen}
          def={formDefs}
          data={viewRow}
          onClose={closeView}
          onUpdate={handleUpdateSuccess}
        />

        <Table
          ref={tableRef}
          table="orderIntegration"
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
