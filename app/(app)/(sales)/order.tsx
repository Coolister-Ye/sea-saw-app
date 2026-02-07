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
import ContactCell from "@/components/sea-saw-page/crm/contact/table/ContactCell";
import OrderInput from "@/components/sea-saw-page/sales/order/input/OrderInput";
import OrderDisplay from "@/components/sea-saw-page/sales/order/display/OrderDisplay";

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
    openCreate,
    openCopy,
    closeView,
    closeEdit,
    handleCreateSuccess,
    handleUpdateSuccess,
    tableRef,
    tableProps,
  } = useEntityPage({
    entity: "order",
    nameField: "order_number",
    excludeFromCopy: ["production_orders", "outbound_orders", "payments"],
  });

  /* ======================== defs 拆分 ======================== */
  const defs = useMemo(() => {
    const pick = (field: string) => formDefs.find((d) => d.field === field);

    return {
      base: formDefs.filter(
        (d) =>
          !["production_orders", "outbound_orders", "payments"].includes(
            d.field,
          ),
      ),
      productionOrders: pick("production_orders"),
      outboundOrders: pick("outbound_orders"),
      payments: pick("payments"),
    };
  }, [formDefs]);

  /* ================= Column Renderers ================= */
  const colRenderers = useMemo(
    () => ({
      contact: { cellRenderer: ContactCell },
    }),
    [],
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
    </PageLoading>
  );
}
