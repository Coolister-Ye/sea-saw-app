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
import useCustomViews from "@/hooks/useCustomViews";
import type { CustomView } from "@/hooks/useCustomViews";
import { resolveParams } from "@/components/sea-saw-design/quick-filter/utils";
import { PageLoading } from "@/components/sea-saw-page/base/PageLoading";
import { PageToolbar } from "@/components/sea-saw-design/page-toolbar";
import { ViewSelector, ViewEditorDialog } from "@/components/sea-saw-design/custom-view";
import type { UserOption, RoleOption } from "@/components/sea-saw-design/custom-view/ViewEditorDialog";
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

  const { views, activeViewId, activeView, setActiveViewId, createView, updateView, deleteView, setDefaultView } = useCustomViews("order_integration");
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
      successMessage: i18n.t("Download task created"),
      errorMessage: i18n.t("Failed to create download task"),
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
            entity="order_integration"
            initialView={editingView ?? undefined}
            headerMeta={headerMeta}
            currentParams={currentFilterParams}
            defaultColumnOrder={DEFAULT_COL_ORDER}
            onSave={handleSaveView}
            userOptions={userOptions}
            roleOptions={roleOptions}
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
            columnOrder={activeColumnOrder}
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
