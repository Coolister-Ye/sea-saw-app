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

  const { activeKey, setActiveKey, resetToAll } = useQuickFilter();
  const { systemPresets, userPresets, createPreset, deletePreset } =
    useFilterPresets("outbound_order");
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
    const option = sections
      .flatMap((s) => s.options)
      .find((o) => o.key === activeKey);
    if (!option) return {};
    return resolveParams(option.params);
  }, [activeKey, sections]);

  // Merged query params: quick filter + sidebar
  const mergedQueryParams = useMemo(
    () => ({ ...activeQuickParams, ...searchParams }),
    [activeQuickParams, searchParams],
  );

  const currentFilterParams = useMemo(
    () => ({ ...activeQuickParams, ...searchParams }),
    [activeQuickParams, searchParams],
  );

  const handleQuickFilterChange = useCallback(
    (key: string) => {
      setActiveKey(key);
      handleSearchReset();
    },
    [setActiveKey, handleSearchReset],
  );

  const handleSearchWithReset = useCallback(
    (params: any) => {
      resetToAll();
      handleSearchFinish(params);
    },
    [resetToAll, handleSearchFinish],
  );

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
              <QuickFilter
                sections={sections}
                activeKey={activeKey}
                onChange={handleQuickFilterChange}
                onAddPreset={() => setPresetModalOpen(true)}
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

          <FilterPresetModal
            open={presetModalOpen}
            onClose={() => setPresetModalOpen(false)}
            currentParams={currentFilterParams}
            onSave={async (name, params) => {
              await createPreset(name, params);
              setPresetModalOpen(false);
            }}
          />

          <OutboundOrderInput
            mode="standalone"
            isOpen={isEditOpen}
            def={baseDefs}
            data={editData}
            columnOrder={DEFAULT_COL_ORDER}
            onClose={closeEditDrawer}
            onCreate={handleCreateSuccess}
            onUpdate={handleUpdateSuccess}
          />

          <OutboundOrderDisplay
            isOpen={outboundOrderView.isOpen}
            def={baseDefs}
            data={outboundOrderView.row}
            columnOrder={DEFAULT_COL_ORDER}
            onClose={closeOutboundOrderView}
            onCreate={handleCreateSuccess}
            onUpdate={handleOutboundOrderUpdate}
            onPipelineCreated={handlePipelineCreated}
          />

          <OutboundOrderTable
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
