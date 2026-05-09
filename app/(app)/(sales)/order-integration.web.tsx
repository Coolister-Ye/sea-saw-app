import React, { useMemo, useState, useCallback } from "react";
import "@/css/tableStyle.css";
import { View } from "react-native";
import { Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

import i18n from "@/locale/i18n";
import { filterFormDefs } from "@/utils/formDefUtils";
import { useEntityMeta } from "@/hooks/useEntityMeta";
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

import OrderGridTable from "@/components/sea-saw-page/sales/order/table/OrderGridTable";
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
  "eta",
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
  "total_purchase_amount",
  "total_outbound_amount",
  "total_received_amount",
  "total_paid_amount",
  "payment_terms",
  "additional_info",
  "comment",
  "attachments",
  "owner",
  "created_at",
  "updated_at",
];

export default function OrderIntegrationScreen() {
  const [orderView, setOrderView] = useState<OrderViewState>({
    row: null,
    isOpen: false,
  });

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
    useFilterPresets("order");
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
    const option = sections
      .flatMap((s) => s.options)
      .find((o) => o.key === activeKey);
    if (!option) return {};
    return resolveParams(option.params);
  }, [activeKey, sections]);

  const mergedQueryParams = useMemo(
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
    "orderIntegration",
    { filterMetaFields: ["allowed_actions"] },
  );

  const { tableRef, gridApiRef, onGridReady } = useTableHandlers();

  const baseDefs = useMemo(
    () => filterFormDefs(formDefs, ["allowed_actions"]),
    [formDefs],
  );

  const closeOrderView = useCallback(() => {
    setOrderView({ row: null, isOpen: false });
  }, []);

  const handleRowClick = useCallback((e: { data: Record<string, any> }) => {
    const row = e.data as OrderRow;
    if (!row) return;
    setOrderView({ row, isOpen: true });
  }, []);

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

  return (
    <PageLoading loading={loadingMeta} error={metaError}>
      <View className="flex-1 bg-white flex-row">
        {isSearchOpen && (
          <OrderSearch
            form={searchForm}
            metadata={headerMeta}
            onFinish={handleSearchWithReset}
            onReset={handleSearchReset}
          />
        )}

        <View className="flex-1">
          <PageToolbar
            filterCount={searchParamCount}
            isSearchOpen={isSearchOpen}
            onToggleSearch={toggleSearch}
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
            currentParams={mergedQueryParams}
            onSave={async (name, params) => {
              await createPreset(name, params);
              setPresetModalOpen(false);
            }}
          />

          <OrderDisplay
            isOpen={orderView.isOpen}
            def={baseDefs}
            data={orderView.row}
            onClose={closeOrderView}
          />

          <OrderGridTable
            ref={tableRef}
            table="orderIntegration"
            headerMeta={headerMeta}
            columnOrder={DEFAULT_COL_ORDER}
            searchable={false}
            queryParams={mergedQueryParams}
            onGridReady={onGridReady}
            onRowClicked={handleRowClick}
          />
        </View>
      </View>
    </PageLoading>
  );
}
