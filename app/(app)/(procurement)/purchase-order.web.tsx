import React, { useMemo, useState, useCallback } from "react";
import "@/css/tableStyle.css";
import { View } from "react-native";
import { Button } from "antd";
import { DownloadOutlined, FileExcelOutlined } from "@ant-design/icons";

import i18n from "@/locale/i18n";
import { getUrl } from "@/utils";
import { filterFormDefs } from "@/utils/formDefUtils";
import { stripIdsDeep } from "@/utils";
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

import PurchaseOrderTable from "@/components/sea-saw-page/procurement/purchase-order/table/PurchaseOrderTable";
import PurchaseOrderInput from "@/components/sea-saw-page/procurement/purchase-order/input/PurchaseOrderInput";
import PurchaseOrderDisplay from "@/components/sea-saw-page/procurement/purchase-order/display/PurchaseOrderDisplay";
import PurchaseOrderSearch from "@/components/sea-saw-page/procurement/purchase-order/search/PurchaseOrderSearch";

type PurchaseOrderRow = Record<string, unknown> & {
  id: number;
  purchase_code: string;
};

interface PurchaseOrderViewState {
  row: PurchaseOrderRow | null;
  isOpen: boolean;
}

const DEFAULT_COL_ORDER = [
  "id",
  "purchase_code",
  "purchase_date",
  "buyer",
  "supplier",
  "shipper",
  "contact",
  "bank_account",
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
  "payment_terms",
  "additional_info",
  "comment",
  "purchase_items",
  "related_order",
  "related_pipeline",
  "attachments",
  "owner",
  "created_at",
  "updated_at",
];

export default function PurchaseOrderScreen() {
  const [purchaseOrderView, setPurchaseOrderView] =
    useState<PurchaseOrderViewState>({ row: null, isOpen: false });
  const [selectedRows, setSelectedRows] = useState<PurchaseOrderRow[]>([]);

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
  const { systemPresets, userPresets, createPreset, deletePreset } = useFilterPresets("purchaseOrder");
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

  // Merged query params: quick filter + sidebar
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

  const buildCopyData = useCallback((data: any) => {
    if (!data) return null;
    const {
      id,
      pk,
      status,
      created_at,
      updated_at,
      attachments,
      related_pipeline,
      related_order,
      buyer,
      supplier,
      shipper,
      contact,
      bank_account,
      ...rest
    } = data;
    const strippedRest = stripIdsDeep(rest);
    return {
      ...strippedRest,
      buyer,
      supplier,
      shipper,
      contact,
      bank_account,
      buyer_id: buyer?.id ?? buyer?.pk ?? data.buyer_id,
      supplier_id: supplier?.id ?? supplier?.pk ?? data.supplier_id,
      shipper_id: shipper?.id ?? shipper?.pk ?? data.shipper_id,
      contact_id: contact?.id ?? contact?.pk ?? data.contact_id,
      bank_account_id:
        bank_account?.id ?? bank_account?.pk ?? data.bank_account_id,
      related_order,
      related_order_id:
        related_order?.id ?? related_order?.pk ?? data.related_order_id,
      related_pipeline,
      related_pipeline_id:
        related_pipeline?.id ??
        related_pipeline?.pk ??
        data.related_pipeline_id,
    };
  }, []);

  const { loadingMeta, metaError, headerMeta, formDefs } = useEntityMeta(
    "purchaseOrder",
    { filterMetaFields: ["allowed_actions"] },
  );

  const { tableRef, gridApiRef, onGridReady, refreshTable } = useTableHandlers();

  const { isEditOpen, editData, openCreate, openCopy, closeEditDrawer } =
    useEditDrawer(gridApiRef, { buildCopyData });

  const baseDefs = useMemo(
    () => filterFormDefs(formDefs, ["allowed_actions"]),
    [formDefs],
  );

  const handleCreateSuccess = useCallback(
    (res?: any) => {
      if (!res) return;
      tableRef.current?.api?.refreshServerSide();
      const data = res.data ?? res;
      if (data?.id)
        setPurchaseOrderView({ row: data as PurchaseOrderRow, isOpen: true });
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

  const closePurchaseOrderView = useCallback(() => {
    setPurchaseOrderView({ row: null, isOpen: false });
  }, []);

  const handlePurchaseOrderUpdate = useCallback(
    (res: any) => {
      handleUpdateSuccess(res);
      const updated = res?.data ?? res;
      if (updated)
        setPurchaseOrderView((prev) => ({
          ...prev,
          row: updated as PurchaseOrderRow,
        }));
    },
    [handleUpdateSuccess],
  );

  const handleRowClick = useCallback((e: { data: PurchaseOrderRow }) => {
    const row = e.data;
    if (!row) return;
    setPurchaseOrderView({ row, isOpen: true });
  }, []);

  const handleSelectionChanged = useCallback(
    (e: { api: { getSelectedRows: () => PurchaseOrderRow[] } }) => {
      setSelectedRows(e.api.getSelectedRows());
    },
    [],
  );

  // Export PO
  const exportPoFn = useCallback(async () => {
    if (selectedRows.length === 0) return;
    const token = await AuthService.getJwtToken();
    if (selectedRows.length === 1) {
      const row = selectedRows[0];
      const url = getUrl("purchaseOrderExportPo").replace(
        "{id}",
        String(row.id),
      );
      await downloadFileWithAuth(url, `PO-${row.purchase_code}.xlsx`, token);
    } else {
      const url = getUrl("purchaseOrderExportPoBulk");
      const ids = selectedRows.map((r) => r.id);
      const filename = `PO-bulk-${ids.length}-orders.xlsx`;
      await downloadFileWithAuth(url, filename, token, {
        method: "POST",
        body: JSON.stringify({ ids }),
        headers: { "Content-Type": "application/json" },
      });
    }
  }, [selectedRows]);
  const { loading: exportingPo, execute: handleExportPo } = useAsyncAction(
    exportPoFn,
    { errorMessage: i18n.t("Failed to export PO") },
  );

  // Download
  const downloadFn = useCallback(
    () =>
      request({
        uri: "crmDownload",
        method: "POST",
        body: { model: "purchase_orders", filter: mergedQueryParams },
      }),
    [request, mergedQueryParams],
  );
  const { loading: downloading, execute: handleDownload } = useAsyncAction(
    downloadFn,
    {
      successMessage: i18n.t("Download task created"),
      errorMessage: i18n.t("Failed to create download task"),
    },
  );

  return (
    <PageLoading loading={loadingMeta} error={metaError}>
      <View className="flex-1 bg-white flex-row">
        {/* Left search sidebar */}
        {isSearchOpen && (
          <PurchaseOrderSearch
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
                  onClick={() => handleExportPo()}
                  loading={exportingPo}
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

          <PurchaseOrderInput
            mode="standalone"
            isOpen={isEditOpen}
            def={baseDefs}
            data={editData}
            columnOrder={DEFAULT_COL_ORDER}
            onClose={closeEditDrawer}
            onCreate={handleCreateSuccess}
            onUpdate={handleUpdateSuccess}
          />

          <PurchaseOrderDisplay
            isOpen={purchaseOrderView.isOpen}
            def={baseDefs}
            data={purchaseOrderView.row}
            columnOrder={DEFAULT_COL_ORDER}
            onClose={closePurchaseOrderView}
            onCreate={handleCreateSuccess}
            onUpdate={handlePurchaseOrderUpdate}
          />

          <PurchaseOrderTable
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
