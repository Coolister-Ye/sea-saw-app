import React from "react";
import "@/css/tableStyle.css";
import { View } from "react-native";

import { useCRMPage } from "@/hooks/useCRMPage";
import { CRMPageLoading } from "@/components/sea-saw-page/crm/common/CRMPageLoading";

import Table from "@/components/sea-saw-design/table";
import { theme } from "@/components/sea-saw-design/table/theme";

import { CompanyFormInput } from "@/components/sea-saw-page/crm/from/input/company";
import { CompanyDisplay } from "@/components/sea-saw-page/crm/from/display/company";
import ActionDropdown from "@/components/sea-saw-design/action-dropdown";

export default function CompanyScreen() {
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
  } = useCRMPage({
    entity: "company",
    nameField: "company_name",
    enableDelete: true,
  });

  return (
    <CRMPageLoading loading={loadingMeta} error={metaError}>
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
        <CompanyFormInput
          isOpen={isEditOpen}
          def={formDefs}
          data={editData}
          onClose={closeEdit}
          onCreate={handleCreateSuccess}
          onUpdate={handleUpdateSuccess}
        />

        {/* View Drawer */}
        <CompanyDisplay
          isOpen={isViewOpen}
          def={formDefs}
          data={viewRow}
          onClose={closeView}
          onUpdate={handleUpdateSuccess}
        />

        {/* Table */}
        <Table
          ref={tableRef}
          table="company"
          headerMeta={headerMeta}
          theme={theme}
          context={{ meta: headerMeta }}
          rowSelection={{ mode: "singleRow" }}
          {...tableProps}
        />
      </View>
    </CRMPageLoading>
  );
}
