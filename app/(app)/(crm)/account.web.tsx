import React, { useState, useCallback } from "react";
import "@/css/tableStyle.css";
import { View } from "react-native";
import { Badge, Button, Form } from "antd";
import { FilterOutlined } from "@ant-design/icons";

import { useEntityPage } from "@/hooks/useEntityPage";
import { PageLoading } from "@/components/sea-saw-page/base/PageLoading";

import AccountTable from "@/components/sea-saw-page/crm/account/table/AccountTable";
import AccountFormInput from "@/components/sea-saw-page/crm/account/input/AccountFormInput";
import AccountDisplay from "@/components/sea-saw-page/crm/account/display/AccountDisplay";
import { AccountSearch } from "@/components/sea-saw-page/crm/account/search/AccountSearch";
import ActionDropdown from "@/components/sea-saw-design/action-dropdown";

const DEFAULT_COL_ORDER = [
  "id",
  "account_name",
  "email",
  "mobile",
  "phone",
  "address",
  "website",
  "industry",
  "roles",
  "description",
  "contacts",
];

export default function AccountScreen() {
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
    deleteDisabled,
    openCreate,
    openCopy,
    openDelete,
    closeView,
    closeEdit,
    handleCreateSuccess,
    handleUpdateSuccess,
    tableRef,
    tableProps,
    contextHolder,
  } = useEntityPage({
    entity: "account",
    nameField: "account_name",
    enableDelete: true,
  });

  const handleSearchFinish = useCallback((filterParams: Record<string, any>) => {
    setSearchParams(filterParams);
  }, []);

  const handleSearchReset = useCallback(() => {
    searchForm.resetFields();
    setSearchParams({});
  }, [searchForm]);

  return (
    <PageLoading loading={loadingMeta} error={metaError}>
      <View className="flex-1 bg-white flex-row">
        {contextHolder}

        {/* Left search sidebar */}
        {isSearchOpen && (
          <AccountSearch
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
              onDelete={openDelete}
              copyDisabled={copyDisabled}
              deleteDisabled={deleteDisabled}
            />
          </View>

          {/* Create / Copy Drawer */}
          <AccountFormInput
            isOpen={isEditOpen}
            def={formDefs}
            data={editData}
            onClose={closeEdit}
            onCreate={handleCreateSuccess}
            onUpdate={handleUpdateSuccess}
            columnOrder={DEFAULT_COL_ORDER}
          />

          {/* View Drawer */}
          <AccountDisplay
            isOpen={isViewOpen}
            def={formDefs}
            data={viewRow}
            onClose={closeView}
            onUpdate={handleUpdateSuccess}
            columnOrder={DEFAULT_COL_ORDER}
          />

          {/* Table */}
          <AccountTable
            tableRef={tableRef}
            headerMeta={headerMeta}
            queryParams={searchParams}
            columnOrder={DEFAULT_COL_ORDER}
            {...tableProps}
          />
        </View>
      </View>
    </PageLoading>
  );
}
