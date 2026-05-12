import React, { useMemo, useState, useCallback } from "react";
import "@/css/tableStyle.css";
import { View } from "react-native";
import { Button } from "antd";
import { DownloadOutlined, FileExcelOutlined } from "@ant-design/icons";

import i18n from "@/locale/i18n";
import { getUrl, stripIdsDeep } from "@/utils";
import { filterFormDefs } from "@/utils/formDefUtils";
import { AuthService } from "@/services/AuthService";
import { downloadFileWithAuth } from "@/utils/fileDownload";
import { useEntityMeta } from "@/hooks/useEntityMeta";
import { useEditDrawer } from "@/hooks/useEditDrawer";
import { useTableHandlers } from "@/hooks/useTableHandlers";
import { useSearchState } from "@/hooks/useSearchState";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import useCustomViews from "@/hooks/useCustomViews";
import { resolveParams } from "@/components/sea-saw-design/quick-filter/utils";
import type { CustomView } from "@/hooks/useCustomViews";
import { PageLoading } from "@/components/sea-saw-page/base/PageLoading";
import { PageToolbar } from "@/components/sea-saw-design/page-toolbar";
import {
  ViewSelector,
  ViewEditorDialog,
} from "@/components/sea-saw-design/custom-view";
import type { UserOption, RoleOption } from "@/components/sea-saw-design/custom-view/ViewEditorDialog";
import useDataService from "@/hooks/useDataService";
import { OrderSearch } from "@/components/sea-saw-page/sales/order/search/OrderSearch";

import OrderTable from "@/components/sea-saw-page/sales/order/table/OrderTable";
import OrderInput from "@/components/sea-saw-page/sales/order/input/OrderInput";
import OrderDisplay from "@/components/sea-saw-page/sales/order/display/OrderDisplay";

type OrderRow = Record<string, unknown> & { id: number; order_code: string };

interface OrderViewState {
  row: OrderRow | null;
  isOpen: boolean;
}

const DEFAULT_COL_ORDER = [
  "id",
  "order_code",
  "order_date",
  "related_pipeline",
  "buyer",
  "seller",
  "shipper",
  "contact",
  "bank_account",
  "etd",
  "status",
  "loading_port",
  "destination_port",
  "shipment_term",
  "inco_terms",
  "order_items",
  "currency",
  "deposit",
  "balance",
  "total_amount",
  "payment_terms",
  "additional_info",
  "comment",
  "attachments",
  "owner",
  "created_at",
  "updated_at",
];

export default function OrderScreen() {
  // Order 自己管理 view 状态（不使用 useViewDrawer，因为行为不同）
  const [orderView, setOrderView] = useState<OrderViewState>({
    row: null,
    isOpen: false,
  });
  const [selectedRows, setSelectedRows] = useState<OrderRow[]>([]);

  const { request } = useDataService();

  const {
    searchParams,
    searchParamCount,
    isSearchOpen,
    searchForm,
    toggleSearch,
    handleSearchFinish,
    handleSearchReset,
  } = useSearchState();

  const {
    views,
    activeViewId,
    activeView,
    setActiveViewId,
    createView,
    updateView,
    deleteView,
    setDefaultView,
  } = useCustomViews("order");

  const [viewEditorOpen, setViewEditorOpen] = useState(false);
  const [editingView, setEditingView] = useState<CustomView | null>(null);

  // User/role options for sharing tab (lazy — only fetched when editor opens)
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [roleOptions, setRoleOptions] = useState<RoleOption[]>([]);

  const fetchSharingOptions = useCallback(async () => {
    try {
      const [usersData, rolesData] = await Promise.all([
        request({ uri: "adminUser", method: "GET" }),
        request({ uri: "adminRole", method: "GET" }),
      ]);
      setUserOptions(
        (usersData?.results ?? usersData ?? []).map((u: any) => ({
          id: u.id,
          username: u.username,
          role_name: u.role?.role_name,
        })),
      );
      setRoleOptions(
        (rolesData?.results ?? rolesData ?? []).map((r: any) => ({
          id: r.id,
          role_name: r.role_name,
        })),
      );
    } catch {
      // Sharing options not critical — fail silently
    }
  }, [request]);

  const handleOpenNewView = useCallback(() => {
    setEditingView(null);
    setViewEditorOpen(true);
    fetchSharingOptions();
  }, [fetchSharingOptions]);

  const handleOpenEditView = useCallback(
    (view: CustomView) => {
      setEditingView(view);
      setViewEditorOpen(true);
      fetchSharingOptions();
    },
    [fetchSharingOptions],
  );

  const handleSaveView = useCallback(
    async (payload: any) => {
      if (editingView) {
        await updateView(editingView.id, payload);
      } else {
        const created = await createView(payload);
        setActiveViewId(created.id);
      }
    },
    [editingView, updateView, createView, setActiveViewId],
  );

  // Resolve active view params
  const activeViewParams = useMemo(
    () => (activeView ? resolveParams(activeView.params) : {}),
    [activeView],
  );

  // Merged query params: view filter + sidebar
  const mergedQueryParams = useMemo(
    () => ({ ...activeViewParams, ...searchParams }),
    [activeViewParams, searchParams],
  );

  // Current sidebar filter state — seeded into view editor on "new view"
  const currentFilterParams = useMemo(
    () => ({ ...activeViewParams, ...searchParams }),
    [activeViewParams, searchParams],
  );

  const handleSelectView = useCallback(
    (view: CustomView) => {
      setActiveViewId(view.id);
      handleSearchReset();
    },
    [setActiveViewId, handleSearchReset],
  );

  // Apply sidebar → deactivate custom view
  const handleSearchWithReset = useCallback(
    (params: any) => {
      setActiveViewId(null);
      handleSearchFinish(params);
    },
    [setActiveViewId, handleSearchFinish],
  );

  // Active column order from view (or page default)
  const activeColumnOrder = useMemo(
    () =>
      activeView?.column_order?.length ? activeView.column_order : DEFAULT_COL_ORDER,
    [activeView],
  );

  // Custom copy builder for order
  const buildOrderCopyData = useCallback((data: any) => {
    if (!data) return null;
    const {
      id,
      pk,
      status,
      created_at,
      updated_at,
      attachments,
      related_pipeline,
      buyer,
      seller,
      shipper,
      contact,
      bank_account,
      ...rest
    } = data;
    const strippedRest = stripIdsDeep(rest);
    return {
      ...strippedRest,
      buyer,
      seller,
      shipper,
      contact,
      bank_account,
      buyer_id: buyer?.id ?? buyer?.pk ?? data.buyer_id,
      seller_id: seller?.id ?? seller?.pk ?? data.seller_id,
      shipper_id: shipper?.id ?? shipper?.pk ?? data.shipper_id,
      contact_id: contact?.id ?? contact?.pk ?? data.contact_id,
      bank_account_id:
        bank_account?.id ?? bank_account?.pk ?? data.bank_account_id,
    };
  }, []);

  // 原子 hooks
  const { loadingMeta, metaError, headerMeta, formDefs } = useEntityMeta(
    "order",
    { filterMetaFields: ["allowed_actions"] },
  );

  const { tableRef, gridApiRef, onGridReady, refreshTable } =
    useTableHandlers();

  const { isEditOpen, editData, openCreate, openCopy, closeEditDrawer } =
    useEditDrawer(gridApiRef, { buildCopyData: buildOrderCopyData });

  const baseDefs = useMemo(
    () => filterFormDefs(formDefs, ["allowed_actions"]),
    [formDefs],
  );

  // Order 自己的 success handlers（更新 orderView.row）
  const handleCreateSuccess = useCallback(
    (res?: any) => {
      if (!res) return;
      tableRef.current?.api?.refreshServerSide();
      const data = res.data ?? res;
      if (data?.id) setOrderView({ row: data as OrderRow, isOpen: true });
    },
    [tableRef],
  );

  const handleUpdateSuccess = useCallback(
    (res?: any) => {
      const updated = res?.data ?? res;
      if (!updated) return;

      const api = tableRef.current?.api;
      if (!api) return;

      const node = api.getRowNode(String(updated.id));
      if (node) {
        node.updateData(updated);
        api.ensureNodeVisible(node, "middle");
      } else {
        api.refreshServerSide({ route: [], purge: false });
      }
    },
    [tableRef],
  );

  const closeOrderView = useCallback(() => {
    setOrderView({ row: null, isOpen: false });
  }, []);

  const handleOrderUpdate = useCallback(
    (res: any) => {
      handleUpdateSuccess(res);
      const updated = res?.data ?? res;
      if (updated)
        setOrderView((prev) => ({ ...prev, row: updated as OrderRow }));
    },
    [handleUpdateSuccess],
  );

  const handlePipelineCreated = useCallback(
    (res: any) => {
      refreshTable();
      const updated = res?.data ?? res;
      if (updated)
        setOrderView((prev) => ({ ...prev, row: updated as OrderRow }));
    },
    [refreshTable],
  );

  const handleRowClick = useCallback((e: { data: OrderRow }) => {
    const row = e.data;
    if (!row) return;
    setOrderView({ row, isOpen: true });
  }, []);

  const handleSelectionChanged = useCallback(
    (e: { api: { getSelectedRows: () => OrderRow[] } }) => {
      setSelectedRows(e.api.getSelectedRows());
    },
    [],
  );

  // Download
  const downloadFn = useCallback(
    () =>
      request({
        uri: "crmDownload",
        method: "POST",
        body: { model: "orders", filter: mergedQueryParams },
      }),
    [request, mergedQueryParams],
  );
  const { loading: downloading, execute: handleDownload } = useAsyncAction(
    downloadFn,
    {
      successMessage: "Download task created",
      errorMessage: "Failed to create download task",
    },
  );

  // Export Sales Contract
  const exportScFn = useCallback(async () => {
    if (selectedRows.length === 0) return;
    const token = await AuthService.getJwtToken();
    if (selectedRows.length === 1) {
      const row = selectedRows[0];
      const url = getUrl("orderExportSc").replace("{id}", String(row.id));
      await downloadFileWithAuth(url, `SC-${row.order_code}.xlsx`, token);
    } else {
      const url = getUrl("orderExportScBulk");
      const ids = selectedRows.map((r) => r.id);
      const filename = `SC-bulk-${ids.length}-orders.xlsx`;
      await downloadFileWithAuth(url, filename, token, {
        method: "POST",
        body: JSON.stringify({ ids }),
        headers: { "Content-Type": "application/json" },
      });
    }
  }, [selectedRows]);
  const { loading: exportingSc, execute: handleExportSc } = useAsyncAction(
    exportScFn,
    { errorMessage: i18n.t("Failed to export sales contract") },
  );

  return (
    <PageLoading loading={loadingMeta} error={metaError}>
      <View className="flex-1 bg-white flex-row">
        {/* Left search sidebar */}
        {isSearchOpen && (
          <OrderSearch
            form={searchForm}
            metadata={headerMeta}
            onFinish={handleSearchWithReset}
            onReset={handleSearchReset}
          />
        )}

        {/* Right: toolbar + table */}
        <View className="flex-1">
          <PageToolbar
            filterCount={searchParamCount}
            isSearchOpen={isSearchOpen}
            onToggleSearch={toggleSearch}
            actionDropdownProps={{
              onPrimaryAction: openCreate,
              onCopy: openCopy,
              copyDisabled: selectedRows.length !== 1,
            }}
            left={
              <ViewSelector
                views={views}
                activeViewId={activeViewId}
                onSelectView={handleSelectView}
                onDeleteView={deleteView}
                onEditView={handleOpenEditView}
                onSetDefaultView={setDefaultView}
                onNewView={handleOpenNewView}
                className="ml-2"
              />
            }
            extra={
              <>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownload()}
                  loading={downloading}
                />
                <Button
                  icon={<FileExcelOutlined />}
                  onClick={() => handleExportSc()}
                  loading={exportingSc}
                  disabled={selectedRows.length === 0}
                />
              </>
            }
          />

          <ViewEditorDialog
            open={viewEditorOpen}
            onClose={() => setViewEditorOpen(false)}
            mode={editingView ? "edit" : "create"}
            entity="order"
            initialView={editingView ?? undefined}
            headerMeta={headerMeta}
            currentParams={currentFilterParams}
            defaultColumnOrder={DEFAULT_COL_ORDER}
            onSave={handleSaveView}
            userOptions={userOptions}
            roleOptions={roleOptions}
          />

          <OrderInput
            mode="standalone"
            isOpen={isEditOpen}
            def={baseDefs}
            data={editData}
            columnOrder={activeColumnOrder}
            onClose={closeEditDrawer}
            onCreate={handleCreateSuccess}
            onUpdate={handleUpdateSuccess}
          />

          <OrderDisplay
            isOpen={orderView.isOpen}
            def={baseDefs}
            data={orderView.row}
            onClose={closeOrderView}
            onCreate={handleCreateSuccess}
            onUpdate={handleOrderUpdate}
            onPipelineCreated={handlePipelineCreated}
            onPipelineUpdate={refreshTable}
          />

          <OrderTable
            ref={tableRef}
            headerMeta={headerMeta}
            columnOrder={activeColumnOrder}
            searchable={false}
            queryParams={mergedQueryParams}
            onGridReady={onGridReady}
            onRowClicked={handleRowClick}
            onSelectionChanged={handleSelectionChanged}
          />
        </View>
      </View>
    </PageLoading>
  );
}
