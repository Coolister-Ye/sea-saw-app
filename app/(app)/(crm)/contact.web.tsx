import React from "react";
import "@/css/tableStyle.css";
import { View } from "react-native";

import { useEntityPage } from "@/hooks/useEntityPage";
import { PageLoading } from "@/components/sea-saw-page/base/PageLoading";

import ContactTable from "@/components/sea-saw-page/crm/contact/table/ContactTable";

import { ContactFormInput } from "@/components/sea-saw-page/crm/contact/input";
import { ContactDisplay } from "@/components/sea-saw-page/crm/contact/display";
import ActionDropdown from "@/components/sea-saw-design/action-dropdown";

export default function ContactScreen() {
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
    entity: "contact",
    nameField: "name",
    enableDelete: true,
  });

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
        <ContactFormInput
          isOpen={isEditOpen}
          def={formDefs}
          data={editData}
          onClose={closeEdit}
          onCreate={handleCreateSuccess}
          onUpdate={handleUpdateSuccess}
        />

        {/* View Drawer */}
        <ContactDisplay
          isOpen={isViewOpen}
          def={formDefs}
          data={viewRow}
          onClose={closeView}
          onUpdate={handleUpdateSuccess}
        />

        {/* Table */}
        <ContactTable
          tableRef={tableRef}
          headerMeta={headerMeta}
          {...tableProps}
        />
      </View>
    </PageLoading>
  );
}
