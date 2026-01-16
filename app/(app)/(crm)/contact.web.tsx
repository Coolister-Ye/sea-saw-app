import React, { useMemo } from "react";
import "@/css/tableStyle.css";
import { View } from "react-native";

import { useCRMPage } from "@/hooks/useCRMPage";
import { CRMPageLoading } from "@/components/sea-saw-page/crm/common/CRMPageLoading";

import Table from "@/components/sea-saw-design/table";
import { theme } from "@/components/sea-saw-design/table/theme";

import { ContactFormInput } from "@/components/sea-saw-page/crm/from/input/contact";
import { ContactDisplay } from "@/components/sea-saw-page/crm/from/display/contact";
import { CompanyPopover } from "@/components/sea-saw-page/crm/from/display/company";
import ActionDropdown from "@/components/sea-saw-page/crm/common/ActionDropdown";

/** Contact 的自定义 copy 逻辑 - 保留 company_id */
function buildContactCopyData(contact: any) {
  if (!contact) return null;

  const { id, pk, created_at, updated_at, company, ...rest } = contact;

  // 保留 company_id 用于 copy 操作
  const copied = { ...rest };
  if (contact.company?.id || contact.company?.pk) {
    copied.company_id = contact.company.id ?? contact.company.pk;
  }

  return copied;
}

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
  } = useCRMPage({
    entity: "contact",
    nameField: "name",
    enableDelete: true,
    buildCopyData: buildContactCopyData,
  });

  /* ================= Column Definitions ================= */
  const colDefinitions = useMemo(
    () => ({
      company: {
        cellRenderer: (params: any) => <CompanyPopover value={params.value} />,
      },
      company_id: {
        hide: true,
      },
    }),
    []
  );

  return (
    <CRMPageLoading loading={loadingMeta} error={metaError}>
      <View className="flex-1 bg-white">
        {contextHolder}

        {/* Top Actions */}
        <View className="flex-row justify-end gap-1 p-1 py-1.5">
          <ActionDropdown
            openCreate={openCreate}
            openCopy={openCopy}
            openDelete={openDelete}
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
        <Table
          ref={tableRef}
          table="contact"
          headerMeta={headerMeta}
          colDefinitions={colDefinitions}
          theme={theme}
          context={{ meta: headerMeta }}
          rowSelection={{ mode: "singleRow" }}
          {...tableProps}
        />
      </View>
    </CRMPageLoading>
  );
}
