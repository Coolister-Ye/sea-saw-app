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
import useQuickFilter from "@/hooks/useQuickFilter";
import useFilterPresets from "@/hooks/useFilterPresets";
import { PageLoading } from "@/components/sea-saw-page/base/PageLoading";
import { PageToolbar } from "@/components/sea-saw-design/page-toolbar";
import {
  QuickFilter,
  FilterPresetModal,
  resolveParams,
} from "@/components/sea-saw-design/quick-filter";
import type { QuickFilterSection } from "@/components/sea-saw-design/quick-filter";
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
  "related_pipeline",
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

  const { activeKey, setActiveKey, resetToAll } = useQuickFilter();
  const { systemPresets, userPresets, createPreset, deletePreset } = useFilterPresets("order");
  const [presetModalOpen, setPresetModalOpen] = useState(false);

  // Build QuickFilter sections from backend presets
  const sections = useMemo<QuickFilterSection[]>(() => {
    const sys: QuickFilterSection = {
      title: i18n.t("quickFilter.presets"),
      options: systemPresets.map((p) => ({
        key: p.key ?? `system_${p.id}`,
        label: p.name,
        params: p.params,
      })),
    };
    const user: QuickFilterSection = {
      title: i18n.t("quickFilter.myPresets"),
      options: userPresets.map((p) => ({
        key: `user_${p.id}`,
        label: p.name,
        params: p.params,
        deletable: true,
        onDelete: () => deletePreset(p.id),
      })),
      divider: true,
    };
    return userPresets.length > 0 ? [sys, user] : [sys];
  }, [systemPresets, userPresets, deletePreset]);

  // Resolve active quick filter params at render time (keeps date-relative values fresh)
  const activeQuickParams = useMemo(() => {
    const option = sections.flatMap((s) => s.options).find((o) => o.key === activeKey);
    if (!option) return {};
    return resolveParams(option.params);
  }, [activeKey, sections]);

  // Merged query params: quick filter + sidebar (sidebar cleared when quick filter is active)
  const mergedQueryParams = useMemo(
    () => ({ ...activeQuickParams, ...searchParams }),
    [activeQuickParams, searchParams],
  );

  // Current filter state for saving as preset
  const currentFilterParams = useMemo(
    () => ({ ...activeQuickParams, ...searchParams }),
    [activeQuickParams, searchParams],
  );

  // Click quick filter → clear sidebar
  const handleQuickFilterChange = useCallback(
    (key: string) => {
      setActiveKey(key);
      handleSearchReset();
    },
    [setActiveKey, handleSearchReset],
  );

  // Apply sidebar → reset quick filter to "All"
  const handleSearchWithReset = useCallback(
    (params: any) => {
      resetToAll();
      handleSearchFinish(params);
    },
    [resetToAll, handleSearchFinish],
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
              <QuickFilter
                sections={sections}
                activeKey={activeKey}
                onChange={handleQuickFilterChange}
                onAddPreset={() => setPresetModalOpen(true)}
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

          <FilterPresetModal
            open={presetModalOpen}
            onClose={() => setPresetModalOpen(false)}
            currentParams={currentFilterParams}
            onSave={async (name, params) => {
              await createPreset(name, params);
              setPresetModalOpen(false);
            }}
          />

          <OrderInput
            mode="standalone"
            isOpen={isEditOpen}
            def={baseDefs}
            data={editData}
            columnOrder={DEFAULT_COL_ORDER}
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
            columnOrder={DEFAULT_COL_ORDER}
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
