import React, { useMemo, useState, useCallback } from "react";
import "@/css/tableStyle.css";
import { View } from "react-native";
import { Badge, Button, Form } from "antd";
import { FilterOutlined } from "@ant-design/icons";

import { useEntityPage } from "@/hooks/useEntityPage";
import { PageLoading } from "@/components/sea-saw-page/base/PageLoading";
import { stripIdsDeep } from "@/utils";
import { OrderSearch } from "@/components/sea-saw-page/sales/order/search/OrderSearch";

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
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Search state
  const [searchForm] = Form.useForm();
  const [searchParams, setSearchParams] = useState<Record<string, any>>({});

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

  const handlePipelineUpdated = useCallback(() => {
    // Refresh table when pipeline is updated (e.g., status change)
    tableRef.current?.api?.refreshServerSide();
  }, [tableRef]);

  const handleRowClick = useCallback((e: any) => {
    const row = e.data;
    if (!row) return;
    // Always open OrderDisplay first, user can click related_pipeline inside to view pipeline
    setOrderViewRow(row);
    setIsOrderViewOpen(true);
  }, []);

  const handleSearchFinish = useCallback(
    (filterParams: Record<string, any>) => {
      setSearchParams(filterParams);
    },
    [],
  );

  const handleSearchReset = useCallback(() => {
    searchForm.resetFields();
    setSearchParams({});
  }, [searchForm]);

  return (
    <PageLoading loading={loadingMeta} error={metaError}>
      <View className="flex-1 bg-white flex-row">
        {/* Left search sidebar — full page height */}
        {isSearchOpen && (
          <OrderSearch
            form={searchForm}
            metadata={headerMeta}
            onFinish={handleSearchFinish}
            onReset={handleSearchReset}
          />
        )}

        {/* Right: toolbar + table */}
        <View className="flex-1">
          <View className="flex-row justify-end gap-1 p-1 py-1.5">
            <Badge count={Object.keys(searchParams).length} size="small">
              <Button
                icon={<FilterOutlined />}
                onClick={() => setIsSearchOpen((prev) => !prev)}
                type={isSearchOpen ? "primary" : "default"}
              />
            </Badge>
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
              onClose={closeOrderView}
              onCreate={handleCreateSuccess}
              onUpdate={handleOrderUpdate}
              onPipelineCreated={handlePipelineCreated}
              onPipelineUpdate={handlePipelineUpdated}
            />
          )}

          <OrderTable
            ref={tableRef}
            headerMeta={headerMeta}
            columnOrder={DEFAULT_COL_ORDER}
            searchable={false}
            queryParams={searchParams}
            {...tableProps}
            onRowClicked={handleRowClick}
          />
        </View>
      </View>
    </PageLoading>
  );
}
