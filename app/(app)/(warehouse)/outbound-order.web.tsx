import React, { useMemo, useState, useCallback } from "react";
import "@/css/tableStyle.css";
import { View } from "react-native";
import { Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

import i18n from "@/locale/i18n";
import { stripIdsDeep } from "@/utils";
import { filterFormDefs } from "@/utils/formDefUtils";
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

import OutboundOrderTable from "@/components/sea-saw-page/warehouse/outbound-order/table/OutboundOrderTable";
import OutboundOrderInput from "@/components/sea-saw-page/warehouse/outbound-order/input/OutboundOrderInput";
import OutboundOrderDisplay from "@/components/sea-saw-page/warehouse/outbound-order/display/OutboundOrderDisplay";
import OutboundOrderSearch from "@/components/sea-saw-page/warehouse/outbound-order/search/OutboundOrderSearch";

type OutboundOrderRow = Record<string, unknown> & {
  id: number;
  outbound_code: string;
};

interface OutboundOrderViewState {
  row: OutboundOrderRow | null;
  isOpen: boolean;
}

const DEFAULT_COL_ORDER = [
  "id",
  "outbound_code",
  "outbound_date",
  "eta",
  "status",
  "container_no",
  "seal_no",
  "destination_port",
  "logistics_provider",
  "loader",
  "remark",
  "related_pipeline",
  "related_pipeline_id",
  "outbound_items",
  "attachments",
  "owner",
  "created_by",
  "updated_by",
  "created_at",
  "updated_at",
];

// Custom copy builder: strip system fields, keep user-editable data
const buildOutboundOrderCopyData = (data: any) => {
  if (!data) return null;
  const {
    id,
    pk,
    status,
    created_at,
    updated_at,
    created_by,
    updated_by,
    attachments,
    ...rest
  } = data;
  return stripIdsDeep(rest);
};

export default function OutboundOrderScreen() {
  const [outboundOrderView, setOutboundOrderView] =
    useState<OutboundOrderViewState>({ row: null, isOpen: false });
  const [selectedRows, setSelectedRows] = useState<OutboundOrderRow[]>([]);

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

  const { views, activeViewId, activeView, setActiveViewId, createView, updateView, deleteView, setDefaultView } = useCustomViews("outbound_order");
  const [viewEditorOpen, setViewEditorOpen] = useState(false);
  const [editingView, setEditingView] = useState<CustomView | null>(null);
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [roleOptions, setRoleOptions] = useState<RoleOption[]>([]);

  const fetchSharingOptions = useCallback(async () => {
    try {
      const [usersData, rolesData] = await Promise.all([request({ uri: "adminUser", method: "GET" }), request({ uri: "adminRole", method: "GET" })]);
      setUserOptions((usersData?.results ?? usersData ?? []).map((u: any) => ({ id: u.id, username: u.username, role_name: u.role?.role_name })));
      setRoleOptions((rolesData?.results ?? rolesData ?? []).map((r: any) => ({ id: r.id, role_name: r.role_name })));
    } catch {}
  }, [request]);

  const activeViewParams = useMemo(() => (activeView ? resolveParams(activeView.params) : {}), [activeView]);
  const mergedQueryParams = useMemo(() => ({ ...activeViewParams, ...searchParams }), [activeViewParams, searchParams]);
  const currentFilterParams = useMemo(() => ({ ...activeViewParams, ...searchParams }), [activeViewParams, searchParams]);
  const activeColumnOrder = useMemo(() => activeView?.column_order?.length ? activeView.column_order : DEFAULT_COL_ORDER, [activeView]);

  const handleSelectView = useCallback((view: CustomView) => { setActiveViewId(view.id); handleSearchReset(); }, [setActiveViewId, handleSearchReset]);
  const handleSearchWithReset = useCallback((params: any) => { setActiveViewId(null); handleSearchFinish(params); }, [setActiveViewId, handleSearchFinish]);
  const handleSaveView = useCallback(async (payload: any) => {
    if (editingView) { await updateView(editingView.id, payload); }
    else { const c = await createView(payload); setActiveViewId(c.id); }
  }, [editingView, updateView, createView, setActiveViewId]);

  const { loadingMeta, metaError, headerMeta, formDefs } = useEntityMeta(
    "outboundOrder",
    { filterMetaFields: ["allowed_actions"] },
  );

  const { tableRef, gridApiRef, onGridReady, refreshTable } =
    useTableHandlers();

  const { isEditOpen, editData, openCreate, openCopy, closeEditDrawer } =
    useEditDrawer(gridApiRef, { buildCopyData: buildOutboundOrderCopyData });

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
        setOutboundOrderView({ row: data as OutboundOrderRow, isOpen: true });
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

  const closeOutboundOrderView = useCallback(() => {
    setOutboundOrderView({ row: null, isOpen: false });
  }, []);

  const handleOutboundOrderUpdate = useCallback(
    (res: any) => {
      handleUpdateSuccess(res);
      const updated = res?.data ?? res;
      if (updated)
        setOutboundOrderView((prev) => ({
          ...prev,
          row: updated as OutboundOrderRow,
        }));
    },
    [handleUpdateSuccess],
  );

  const handlePipelineCreated = useCallback(
    (res: any) => {
      refreshTable();
      const updated = res?.data ?? res;
      if (updated)
        setOutboundOrderView((prev) => ({
          ...prev,
          row: updated as OutboundOrderRow,
        }));
    },
    [refreshTable],
  );

  const handleRowClick = useCallback((e: { data: OutboundOrderRow }) => {
    const row = e.data;
    if (!row) return;
    setOutboundOrderView({ row, isOpen: true });
  }, []);

  const handleSelectionChanged = useCallback(
    (e: { api: { getSelectedRows: () => OutboundOrderRow[] } }) => {
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
        body: { model: "outbound_orders", filter: mergedQueryParams },
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
          <OutboundOrderSearch
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
              <Button
                icon={<DownloadOutlined />}
                onClick={() => handleDownload()}
                loading={downloading}
              />
            }
          />

          <ViewEditorDialog
            open={viewEditorOpen}
            onClose={() => setViewEditorOpen(false)}
            mode={editingView ? "edit" : "create"}
            entity="outbound_order"
            initialView={editingView ?? undefined}
            headerMeta={headerMeta}
            currentParams={currentFilterParams}
            defaultColumnOrder={DEFAULT_COL_ORDER}
            onSave={handleSaveView}
            userOptions={userOptions}
            roleOptions={roleOptions}
          />

          <OutboundOrderInput
            mode="standalone"
            isOpen={isEditOpen}
            def={baseDefs}
            data={editData}
            columnOrder={activeColumnOrder}
            onClose={closeEditDrawer}
            onCreate={handleCreateSuccess}
            onUpdate={handleUpdateSuccess}
          />

          <OutboundOrderDisplay
            isOpen={outboundOrderView.isOpen}
            def={baseDefs}
            data={outboundOrderView.row}
            columnOrder={activeColumnOrder}
            onClose={closeOutboundOrderView}
            onCreate={handleCreateSuccess}
            onUpdate={handleOutboundOrderUpdate}
            onPipelineCreated={handlePipelineCreated}
          />

          <OutboundOrderTable
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
