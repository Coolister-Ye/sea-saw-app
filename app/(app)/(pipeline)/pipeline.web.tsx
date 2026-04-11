import React, { useMemo } from "react";
import "@/css/tableStyle.css";
import { View } from "react-native";

import { useEntityPage } from "@/hooks/useEntityPage";
import { useSearchState } from "@/hooks/useSearchState";
import { PageLoading } from "@/components/sea-saw-page/base/PageLoading";
import { PageToolbar } from "@/components/sea-saw-design/page-toolbar";
import { pickFormDef, filterFormDefs } from "@/utils/formDefUtils";

import PipelineTable from "@/components/sea-saw-page/pipeline/table/PipelineTable";
import PipelineSearch from "@/components/sea-saw-page/pipeline/search/PipelineSearch";
import PipelineInput from "@/components/sea-saw-page/pipeline/input/standalone/PipelineInput";
import PipelineDisplay from "@/components/sea-saw-page/pipeline/display/PipelineDisplay";
import type { PipelineDefs } from "@/components/sea-saw-page/pipeline/display/types";

const EXCLUDED_FIELDS = [
  "order",
  "production_orders",
  "purchase_orders",
  "outbound_orders",
  "payments",
  "allowed_actions",
] as const;

const DEFAULT_COL_ORDER = [
  // 基本信息
  "id",
  "pipeline_code",
  "pipeline_type",
  "status",
  "active_entity",
  // 客户信息
  "account",
  "contact",
  // 时间节点
  "order_date",
  "confirmed_at",
  "completed_at",
  "cancelled_at",
  // 财务汇总
  "order_total_amount",
  "received_order_total_amount",
  "purchase_order_total_amount",
  "paid_purchase_order_total_amount",
  "purchase_margin",
  // 阶段时间
  "in_purchase_at",
  "purchase_completed_at",
  "in_production_at",
  "production_completed_at",
  "in_purchase_and_production_at",
  "purchase_and_production_completed_at",
  "in_outbound_at",
  "outbound_completed_at",
  // 关联单据
  "order",
  "purchase_orders",
  "production_orders",
  "outbound_orders",
  "payments",
  // 其他
  "remark",
  "owner",
  "created_by",
  "updated_by",
  "created_at",
  "updated_at",
];

export default function PipelineScreen() {
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
    loadingMeta,
    metaError,
    headerMeta,
    formDefs,
    isEditOpen,
    isViewOpen,
    viewRow,
    editData,
    copyDisabled,
    openCreate,
    openCopy,
    closeView,
    closeEdit,
    handleCreateSuccess,
    handleUpdateSuccess,
    tableRef,
    tableProps,
  } = useEntityPage({
    entity: "pipeline",
    nameField: "name",
    excludeFromCopy: [
      "order",
      "production_orders",
      "purchase_orders",
      "outbound_orders",
      "payments",
    ],
    filterMetaFields: ["allowed_actions"],
  });

  const categorizedDefs = useMemo((): PipelineDefs => {
    return {
      base: filterFormDefs(formDefs, [...EXCLUDED_FIELDS]),
      orders: pickFormDef(formDefs, "order"),
      productionOrders: pickFormDef(formDefs, "production_orders"),
      purchaseOrders: pickFormDef(formDefs, "purchase_orders"),
      outboundOrders: pickFormDef(formDefs, "outbound_orders"),
      payments: pickFormDef(formDefs, "payments"),
    };
  }, [formDefs]);

  return (
    <PageLoading loading={loadingMeta} error={metaError}>
      <View className="flex-1 bg-white flex-row">
        {/* Left search sidebar */}
        {isSearchOpen && (
          <PipelineSearch
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
              onCopy: openCopy,
              copyDisabled,
            }}
          />

          <PipelineInput
            isOpen={isEditOpen}
            def={categorizedDefs.base}
            data={editData}
            onClose={closeEdit}
            onCreate={handleCreateSuccess}
            onUpdate={handleUpdateSuccess}
          />

          <PipelineDisplay
            isOpen={isViewOpen}
            defs={categorizedDefs}
            data={viewRow}
            onClose={closeView}
            onCreate={handleCreateSuccess}
            onUpdate={handleUpdateSuccess}
          />

          <PipelineTable
            ref={tableRef}
            headerMeta={headerMeta}
            columnOrder={DEFAULT_COL_ORDER}
            searchable={false}
            queryParams={searchParams}
            {...tableProps}
          />
        </View>
      </View>
    </PageLoading>
  );
}
