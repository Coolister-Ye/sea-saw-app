import React, { useMemo, useState, useCallback } from "react";
import "@/css/tableStyle.css";
import { View } from "react-native";
import { Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

import i18n from "@/locale/i18n";
import { filterFormDefs } from "@/utils/formDefUtils";
import { useEntityMeta } from "@/hooks/useEntityMeta";
import { useEditDrawer } from "@/hooks/useEditDrawer";
import { useTableHandlers } from "@/hooks/useTableHandlers";
import { useSearchState } from "@/hooks/useSearchState";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { PageLoading } from "@/components/sea-saw-page/base/PageLoading";
import { PageToolbar } from "@/components/sea-saw-design/page-toolbar";
import useDataService from "@/hooks/useDataService";

import OutboundOrderTable from "@/components/sea-saw-page/warehouse/outbound-order/table/OutboundOrderTable";
import OutboundOrderInput from "@/components/sea-saw-page/warehouse/outbound-order/input/nested/OutboundOrderInput";
import StandaloneOutboundOrderDisplay from "@/components/sea-saw-page/warehouse/outbound-order/display/StandaloneOutboundOrderDisplay";
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
  "outbound_items",
  "attachments",
  "owner",
  "created_by",
  "updated_by",
  "created_at",
  "updated_at",
];

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

  const { loadingMeta, metaError, headerMeta, formDefs } = useEntityMeta(
    "outboundOrder",
    { filterMetaFields: ["allowed_actions"] },
  );

  const { tableRef, gridApiRef, onGridReady, refreshTable } = useTableHandlers();

  const { isEditOpen, editData, openCreate, closeEditDrawer } =
    useEditDrawer(gridApiRef);

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
        body: { model: "outbound_orders", filter: searchParams },
      }),
    [request, searchParams],
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
            onFinish={handleSearchFinish}
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
            }}
            extra={
              <Button
                icon={<DownloadOutlined />}
                onClick={() => handleDownload()}
                loading={downloading}
              />
            }
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

          <StandaloneOutboundOrderDisplay
            isOpen={outboundOrderView.isOpen}
            def={baseDefs}
            data={outboundOrderView.row}
            columnOrder={DEFAULT_COL_ORDER}
            onClose={closeOutboundOrderView}
            onCreate={handleCreateSuccess}
            onUpdate={handleOutboundOrderUpdate}
          />

          <OutboundOrderTable
            ref={tableRef}
            headerMeta={headerMeta}
            columnOrder={DEFAULT_COL_ORDER}
            searchable={false}
            queryParams={searchParams}
            onGridReady={onGridReady}
            onRowClicked={handleRowClick}
            onSelectionChanged={handleSelectionChanged}
          />
        </View>
      </View>
    </PageLoading>
  );
}
