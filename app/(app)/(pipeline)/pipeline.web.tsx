import React, { useMemo, useState, useCallback } from "react";
import "@/css/tableStyle.css";
import { View } from "react-native";
import { Badge, Button, Form } from "antd";
import { FilterOutlined } from "@ant-design/icons";

import { useEntityPage } from "@/hooks/useEntityPage";
import { PageLoading } from "@/components/sea-saw-page/base/PageLoading";
import { pickFormDef, filterFormDefs } from "@/utils/formDefUtils";

import PipelineTable from "@/components/sea-saw-page/pipeline/table/PipelineTable";
import PipelineSearch from "@/components/sea-saw-page/pipeline/search/PipelineSearch";
import ActionDropdown from "@/components/sea-saw-design/action-dropdown";
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
  "id",
  "pipeline_code",
  "name",
  "pipeline_type",
  "status",
  "account",
  "contact",
  "order",
  "purchase_orders",
  "production_orders",
  "outbound_orders",
  "payments",
  "owner",
  "created_by",
  "updated_by",
  "created_at",
  "updated_at",
];

export default function PipelineScreen() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchForm] = Form.useForm();
  const [searchParams, setSearchParams] = useState<Record<string, any>>({});

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

  const handleSearchFinish = useCallback(
    (filterParams: Record<string, any>) => {
      setSearchParams(filterParams);
    },
    [],
  );

  const handleSearchReset = useCallback(() => {
    searchForm.resetFields();
    setSearchParams({});
  }, [searchForm]);

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
          <View className="flex-row justify-end gap-1 p-1 py-1.5">
            <Badge count={Object.keys(searchParams).length} size="small">
              <Button
                icon={<FilterOutlined />}
                onClick={() => setIsSearchOpen((prev) => !prev)}
                type={isSearchOpen ? "primary" : "default"}
              />
            </Badge>
            <ActionDropdown
              onPrimaryAction={openCreate}
              onCopy={openCopy}
              copyDisabled={copyDisabled}
            />
          </View>

          {isEditOpen && (
            <PipelineInput
              isOpen
              def={categorizedDefs.base}
              data={editData}
              onClose={closeEdit}
              onCreate={handleCreateSuccess}
              onUpdate={handleUpdateSuccess}
            />
          )}

          {isViewOpen && (
            <PipelineDisplay
              isOpen
              defs={categorizedDefs}
              data={viewRow}
              onClose={closeView}
              onCreate={handleCreateSuccess}
              onUpdate={handleUpdateSuccess}
            />
          )}

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
