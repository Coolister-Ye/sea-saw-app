import React, { useMemo, useState, useCallback } from "react";
import "@/css/tableStyle.css";
import { View } from "react-native";

import { useEntityPage } from "@/hooks/useEntityPage";
import { PageLoading } from "@/components/sea-saw-page/base/PageLoading";
import { stripIdsDeep } from "@/utils";

import OrderTable from "@/components/sea-saw-page/sales/order/table/OrderTable";
import ActionDropdown from "@/components/sea-saw-design/action-dropdown";
import OrderInput from "@/components/sea-saw-page/sales/order/input/OrderInput";
import OrderDisplay from "@/components/sea-saw-page/sales/order/display/OrderDisplay";

const DEFAULT_COL_ORDER = [
  "id",
  "order_code",
  "order_date",
  "account",
  "contact",
  "etd",
  "status",
  "loading_port",
  "destination_port",
  "shipment_term",
  "inco_terms",
  "currency",
  "deposit",
  "balance",
  "total_amount",
  "comment",
  "attachments",
  "related_pipeline",
  "order_items",
  "owner",
  "created_by",
  "updated_by",
  "created_at",
  "updated_at",
];

export default function OrderScreen() {
  // Order view state
  const [orderViewRow, setOrderViewRow] = useState<any>(null);
  const [isOrderViewOpen, setIsOrderViewOpen] = useState(false);

  // Custom copy builder for order
  const buildOrderCopyData = useCallback((data: any) => {
    if (!data) return null;

    // Remove metadata fields and extract account/contact for special handling
    const {
      id,
      pk,
      status,
      created_at,
      updated_at,
      attachments,
      related_pipeline,
      account,
      contact,
      ...rest
    } = data;

    // Strip IDs from rest of the data (like order_items)
    const strippedRest = stripIdsDeep(rest);

    // Build final copy data
    return {
      ...strippedRest,
      // Keep account/contact objects for display in InputForm
      account,
      contact,
      // Extract IDs for write operations
      account_id: account?.id || data.account_id,
      contact_id: contact?.id || data.contact_id,
    };
  }, []);

  const {
    loadingMeta,
    metaError,
    headerMeta,
    formDefs,
    isEditOpen,
    editData,
    copyDisabled,
    openCreate,
    openCopy,
    closeEdit,
    handleCreateSuccess,
    handleUpdateSuccess,
    tableRef,
    tableProps,
  } = useEntityPage({
    entity: "order",
    nameField: "order_number",
    buildCopyData: buildOrderCopyData,
    filterMetaFields: ["allowed_actions"],
  });

  const defs = useMemo(
    () => ({
      base: formDefs.filter((d) => !["allowed_actions"].includes(d.field)),
    }),
    [formDefs],
  );

  const closeOrderView = useCallback(() => {
    setIsOrderViewOpen(false);
    setOrderViewRow(null);
  }, []);

  const handleOrderUpdate = useCallback(
    (res: any) => {
      handleUpdateSuccess(res);
      const updated = res?.data ?? res;
      if (updated) setOrderViewRow(updated);
    },
    [handleUpdateSuccess],
  );

  const handlePipelineCreated = useCallback(
    (res: any) => {
      // Refresh table when pipeline is created
      tableRef.current?.api?.refreshServerSide();
      // Update display with new order data (includes related_pipeline)
      const updated = res?.data ?? res;
      if (updated) setOrderViewRow(updated);
    },
    [tableRef],
  );

  const handleRowClick = useCallback((e: any) => {
    const row = e.data;
    if (!row) return;
    // Always open OrderDisplay first, user can click related_pipeline inside to view pipeline
    setOrderViewRow(row);
    setIsOrderViewOpen(true);
  }, []);

  return (
    <PageLoading loading={loadingMeta} error={metaError}>
      <View className="flex-1 bg-white">
        <View className="flex-row justify-end gap-1 p-1 py-1.5">
          <ActionDropdown
            onPrimaryAction={openCreate}
            onCopy={openCopy}
            copyDisabled={copyDisabled}
          />
        </View>

        {isEditOpen && (
          <OrderInput
            mode="standalone"
            isOpen
            def={defs.base}
            data={editData}
            columnOrder={DEFAULT_COL_ORDER}
            onClose={closeEdit}
            onCreate={handleCreateSuccess}
            onUpdate={handleUpdateSuccess}
          />
        )}

        {isOrderViewOpen && (
          <OrderDisplay
            isOpen
            def={defs.base}
            data={orderViewRow}
            columnOrder={DEFAULT_COL_ORDER}
            onClose={closeOrderView}
            onCreate={handleCreateSuccess}
            onUpdate={handleOrderUpdate}
            onPipelineCreated={handlePipelineCreated}
          />
        )}

        <OrderTable
          ref={tableRef}
          headerMeta={headerMeta}
          columnOrder={DEFAULT_COL_ORDER}
          {...tableProps}
          onRowClicked={handleRowClick}
        />
      </View>
    </PageLoading>
  );
}
