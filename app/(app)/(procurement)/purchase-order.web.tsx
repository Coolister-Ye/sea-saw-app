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
import useCustomViews from "@/hooks/useCustomViews";
import type { CustomView } from "@/hooks/useCustomViews";
import { resolveParams } from "@/components/sea-saw-design/quick-filter/utils";
import { PageLoading } from "@/components/sea-saw-page/base/PageLoading";
import { PageToolbar } from "@/components/sea-saw-design/page-toolbar";
import { ViewSelector, ViewEditorDialog } from "@/components/sea-saw-design/custom-view";
import type { UserOption, RoleOption } from "@/components/sea-saw-design/custom-view/ViewEditorDialog";
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

  const {
    views,
    activeViewId,
    activeView,
    setActiveViewId,
    createView,
    updateView,
    deleteView,
    setDefaultView,
  } = useCustomViews("purchaseOrder");

  const [viewEditorOpen, setViewEditorOpen] = useState(false);
  const [editingView, setEditingView] = useState<CustomView | null>(null);
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [roleOptions, setRoleOptions] = useState<RoleOption[]>([]);

  const fetchSharingOptions = useCallback(async () => {
    try {
      const [usersData, rolesData] = await Promise.all([
        request({ uri: "adminUser", method: "GET" }),
        request({ uri: "adminRole", method: "GET" }),
      ]);
      setUserOptions((usersData?.results ?? usersData ?? []).map((u: any) => ({ id: u.id, username: u.username, role_name: u.role?.role_name })));
      setRoleOptions((rolesData?.results ?? rolesData ?? []).map((r: any) => ({ id: r.id, role_name: r.role_name })));
    } catch {}
  }, [request]);

  const activeViewParams = useMemo(
    () => (activeView ? resolveParams(activeView.params) : {}),
    [activeView],
  );
  const mergedQueryParams = useMemo(
    () => ({ ...activeViewParams, ...searchParams }),
    [activeViewParams, searchParams],
  );
  const currentFilterParams = useMemo(
    () => ({ ...activeViewParams, ...searchParams }),
    [activeViewParams, searchParams],
  );
  const activeColumnOrder = useMemo(
    () => activeView?.column_order?.length ? activeView.column_order : DEFAULT_COL_ORDER,
    [activeView],
  );

  const handleSelectView = useCallback((view: CustomView) => { setActiveViewId(view.id); handleSearchReset(); }, [setActiveViewId, handleSearchReset]);
  const handleSearchWithReset = useCallback((params: any) => { setActiveViewId(null); handleSearchFinish(params); }, [setActiveViewId, handleSearchFinish]);
  const handleSaveView = useCallback(async (payload: any) => {
    if (editingView) { await updateView(editingView.id, payload); }
    else { const c = await createView(payload); setActiveViewId(c.id); }
  }, [editingView, updateView, createView, setActiveViewId]);

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

  // Export Purchase Contract
  const exportPcFn = useCallback(async () => {
    if (selectedRows.length === 0) return;
    const token = await AuthService.getJwtToken();
    if (selectedRows.length === 1) {
      const row = selectedRows[0];
      const url = getUrl("purchaseOrderExportPc").replace(
        "{id}",
        String(row.id),
      );
      await downloadFileWithAuth(url, `PC-${row.purchase_code}.xlsx`, token);
    } else {
      const url = getUrl("purchaseOrderExportPcBulk");
      const ids = selectedRows.map((r) => r.id);
      const filename = `PC-bulk-${ids.length}-orders.xlsx`;
      await downloadFileWithAuth(url, filename, token, {
        method: "POST",
        body: JSON.stringify({ ids }),
        headers: { "Content-Type": "application/json" },
      });
    }
  }, [selectedRows]);
  const { loading: exportingPc, execute: handleExportPc } = useAsyncAction(
    exportPcFn,
    { errorMessage: i18n.t("Failed to export purchase contract") },
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
              <ViewSelector
                views={views}
                activeViewId={activeViewId}
                onSelectView={handleSelectView}
                onDeleteView={deleteView}
                onEditView={(v) => { setEditingView(v); setViewEditorOpen(true); fetchSharingOptions(); }}
                onSetDefaultView={setDefaultView}
                onNewView={() => { setEditingView(null); setViewEditorOpen(true); fetchSharingOptions(); }}
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
                  onClick={() => handleExportPc()}
                  loading={exportingPc}
                  disabled={selectedRows.length === 0}
                />
              </>
            }
          />

          <ViewEditorDialog
            open={viewEditorOpen}
            onClose={() => setViewEditorOpen(false)}
            mode={editingView ? "edit" : "create"}
            entity="purchaseOrder"
            initialView={editingView ?? undefined}
            headerMeta={headerMeta}
            currentParams={currentFilterParams}
            defaultColumnOrder={DEFAULT_COL_ORDER}
            onSave={handleSaveView}
            userOptions={userOptions}
            roleOptions={roleOptions}
          />

          <PurchaseOrderInput
            mode="standalone"
            isOpen={isEditOpen}
            def={baseDefs}
            data={editData}
            columnOrder={activeColumnOrder}
            onClose={closeEditDrawer}
            onCreate={handleCreateSuccess}
            onUpdate={handleUpdateSuccess}
          />

          <PurchaseOrderDisplay
            isOpen={purchaseOrderView.isOpen}
            def={baseDefs}
            data={purchaseOrderView.row}
            columnOrder={activeColumnOrder}
            onClose={closePurchaseOrderView}
            onCreate={handleCreateSuccess}
            onUpdate={handlePurchaseOrderUpdate}
          />

          <PurchaseOrderTable
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
