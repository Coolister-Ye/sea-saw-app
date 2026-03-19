import React, { useCallback, useState } from "react";
import "@/css/tableStyle.css";
import { View } from "react-native";
import { Badge, Button, Form } from "antd";
import { FilterOutlined } from "@ant-design/icons";

import { useEntityPage } from "@/hooks/useEntityPage";
import { PageLoading } from "@/components/sea-saw-page/base/PageLoading";
import { stripIdsDeep } from "@/utils";

import ActionDropdown from "@/components/sea-saw-design/action-dropdown";
import ProductionTable from "@/components/sea-saw-page/production/production-order/table/ProductionTable";
import ProductionOrderInput from "@/components/sea-saw-page/production/production-order/input/ProductionOrderInput";
import ProductionOrderDisplay from "@/components/sea-saw-page/production/production-order/display/ProductionOrderDisplay";
import ProductionSearch from "@/components/sea-saw-page/production/production-order/search/ProductionSearch";

export default function ProductionScreen() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchForm] = Form.useForm();
  const [searchParams, setSearchParams] = useState<Record<string, any>>({});

  /** 自定义 copy 逻辑 - 排除 production_code */
  const buildProductionCopyData = useCallback((productionOrder: any) => {
    if (!productionOrder) return null;
    const { id, pk, production_code, created_at, updated_at, ...rest } =
      productionOrder;
    return stripIdsDeep(rest);
  }, []);

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
    entity: "productionOrder",
    nameField: "production_code",
    buildCopyData: buildProductionCopyData,
  });

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
        {/* Left search sidebar — full page height */}
        {isSearchOpen && (
          <ProductionSearch
            form={searchForm}
            metadata={headerMeta}
            onFinish={handleSearchFinish}
            onReset={handleSearchReset}
          />
        )}

        {/* Right: toolbar + table */}
        <View className="flex-1">
          {/* Top Actions */}
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

          {/* Create / Copy Drawer */}
          {isEditOpen && (
            <ProductionOrderInput
              mode="standalone"
              isOpen
              def={formDefs}
              data={editData}
              onClose={closeEdit}
              onCreate={handleCreateSuccess}
              onUpdate={handleUpdateSuccess}
            />
          )}

          {/* View Drawer */}
          {isViewOpen && (
            <ProductionOrderDisplay
              isOpen
              def={formDefs}
              data={viewRow}
              onClose={closeView}
              onUpdate={handleUpdateSuccess}
            />
          )}

          {/* Table */}
          <ProductionTable
            ref={tableRef}
            headerMeta={headerMeta}
            queryParams={searchParams}
            {...tableProps}
          />
        </View>
      </View>
    </PageLoading>
  );
}
