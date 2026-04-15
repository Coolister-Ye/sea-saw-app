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

import ProductionTable from "@/components/sea-saw-page/production/production-order/table/ProductionTable";
import ProductionOrderInput from "@/components/sea-saw-page/production/production-order/input/ProductionOrderInput";
import ProductionOrderDisplay from "@/components/sea-saw-page/production/production-order/display/ProductionOrderDisplay";
import ProductionSearch from "@/components/sea-saw-page/production/production-order/search/ProductionSearch";

type ProductionOrderRow = Record<string, unknown> & {
  id: number;
  production_code: string;
};

interface ProductionOrderViewState {
  row: ProductionOrderRow | null;
  isOpen: boolean;
}

const DEFAULT_COL_ORDER = [
  "id",
  "production_code",
  "status",
  "related_order",
  "planned_date",
  "start_date",
  "end_date",
  "planned_qty",
  "produced_qty",
  "remark",
  "comment",
  "production_items",
  "attachments",
  "related_pipeline",
  "owner",
  "created_at",
  "updated_at",
];

const buildProductionCopyData = (data: any) => {
  if (!data) return null;
  const { id, pk, production_code, created_at, updated_at, attachments, related_pipeline, ...rest } = data;
  return stripIdsDeep(rest);
};

export default function ProductionScreen() {
  const [productionOrderView, setProductionOrderView] =
    useState<ProductionOrderViewState>({ row: null, isOpen: false });
  const [selectedRows, setSelectedRows] = useState<ProductionOrderRow[]>([]);

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
  const { systemPresets, userPresets, createPreset, deletePreset } = useFilterPresets("productionOrder");
  const [presetModalOpen, setPresetModalOpen] = useState(false);

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

  const activeQuickParams = useMemo(() => {
    const option = sections.flatMap((s) => s.options).find((o) => o.key === activeKey);
    if (!option) return {};
    return resolveParams(option.params);
  }, [activeKey, sections]);

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
    "productionOrder",
    { filterMetaFields: ["allowed_actions"] },
  );

  const { tableRef, gridApiRef, onGridReady } = useTableHandlers();

  const { isEditOpen, editData, openCreate, openCopy, closeEditDrawer } =
    useEditDrawer(gridApiRef, { buildCopyData: buildProductionCopyData });

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
        setProductionOrderView({ row: data as ProductionOrderRow, isOpen: true });
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

  const closeProductionOrderView = useCallback(() => {
    setProductionOrderView({ row: null, isOpen: false });
  }, []);

  const handleProductionOrderUpdate = useCallback(
    (res: any) => {
      handleUpdateSuccess(res);
      const updated = res?.data ?? res;
      if (updated)
        setProductionOrderView((prev) => ({
          ...prev,
          row: updated as ProductionOrderRow,
        }));
    },
    [handleUpdateSuccess],
  );

  const handleRowClick = useCallback((e: { data: ProductionOrderRow }) => {
    const row = e.data;
    if (!row) return;
    setProductionOrderView({ row, isOpen: true });
  }, []);

  const handleSelectionChanged = useCallback(
    (e: { api: { getSelectedRows: () => ProductionOrderRow[] } }) => {
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
        body: { model: "production_orders", filter: mergedQueryParams },
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
          <ProductionSearch
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

          <ProductionOrderInput
            mode="standalone"
            isOpen={isEditOpen}
            def={baseDefs}
            data={editData}
            columnOrder={DEFAULT_COL_ORDER}
            onClose={closeEditDrawer}
            onCreate={handleCreateSuccess}
            onUpdate={handleUpdateSuccess}
          />

          <ProductionOrderDisplay
            isOpen={productionOrderView.isOpen}
            def={baseDefs}
            data={productionOrderView.row}
            columnOrder={DEFAULT_COL_ORDER}
            onClose={closeProductionOrderView}
            onCreate={handleCreateSuccess}
            onUpdate={handleProductionOrderUpdate}
          />

          <ProductionTable
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
