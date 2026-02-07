import React, { useState } from "react";
import "@/css/tableStyle.css";
import { View } from "react-native";
import { Tabs } from "antd";
import i18n from "@/locale/i18n";

import { useEntityPage } from "@/hooks/useEntityPage";
import { PageLoading } from "@/components/sea-saw-page/base/PageLoading";

import AccountTable from "@/components/sea-saw-page/crm/account/table/AccountTable";
import AccountFormInput from "@/components/sea-saw-page/crm/account/input/AccountFormInput";
import AccountDisplay from "@/components/sea-saw-page/crm/account/display/AccountDisplay";
import ActionDropdown from "@/components/sea-saw-design/action-dropdown";

type RoleFilter = "all" | "customer" | "supplier" | "prospect";
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
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");

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

  // Build query params based on role filter
  const queryParams = roleFilter !== "all" ? { role: roleFilter } : undefined;

  const tabItems = [
    {
      key: "all",
      label: i18n.t("All Accounts"),
    },
    {
      key: "customer",
      label: i18n.t("Customers"),
    },
    {
      key: "supplier",
      label: i18n.t("Suppliers"),
    },
  ];

  return (
    <PageLoading loading={loadingMeta} error={metaError}>
      <View className="flex-1 bg-white">
        {contextHolder}

        {/* Top Actions */}
        <View className="flex-row justify-end gap-1 p-1 py-1.5">
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
          queryParams={queryParams}
          roleFilter={roleFilter}
          columnOrder={DEFAULT_COL_ORDER}
          {...tableProps}
        />

        {/* Role Filter Tabs - Excel Style Bottom Tabs */}
        <View className="bg-gray-50 border-t border-gray-200">
          <Tabs
            type="card"
            size="small"
            activeKey={roleFilter}
            onChange={(key) => setRoleFilter(key as RoleFilter)}
            items={tabItems}
            className="px-2"
            style={{ marginBottom: 0 }}
            tabBarStyle={{ marginBottom: 1, paddingBottom: 4 }}
          />
        </View>
      </View>
    </PageLoading>
  );
}
