import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import "@/css/tableStyle.css";
import { View, ActivityIndicator } from "react-native";
import { Modal, message } from "antd";

import { HeaderMetaProps } from "@/components/sea-saw-design/table/interface";
import { useLocale } from "@/context/Locale";
import useDataService from "@/hooks/useDataService";
import { FormDef } from "@/hooks/useFormDefs";
import { normalizeBoolean } from "@/utils";

import { Text } from "@/components/ui/text";
import Table from "@/components/sea-saw-design/table";
import { myTableTheme } from "@/components/sea-saw-design/table/theme";

import { CompanyFormInput } from "@/components/sea-saw-page/crm/from/input/company";
import { CompanyDisplay } from "@/components/sea-saw-page/crm/from/display/company";
import ActionDropdown from "@/components/sea-saw-page/crm/common/ActionDropdown";

/* ========================
 * Utils
 * ======================== */

/** Strip ids for copy operation */
function stripIdsDeep(value: any): any {
  if (Array.isArray(value)) return value.map(stripIdsDeep);
  if (value && typeof value === "object") {
    const result: any = {};
    Object.entries(value).forEach(([key, val]) => {
      if (key === "id" || key === "pk") return;
      result[key] = stripIdsDeep(val);
    });
    return result;
  }
  return value;
}

function buildCopyBase(company: any) {
  if (!company) return null;
  const { id, pk, created_at, updated_at, ...rest } = company;
  return stripIdsDeep(rest);
}

/* ========================
 * Component
 * ======================== */

export default function CompanyScreen() {
  const { i18n } = useLocale();
  const { getViewSet } = useDataService();
  const companyViewSet = useMemo(() => getViewSet("company"), [getViewSet]);

  const tableRef = useRef<any>(null);
  const gridApiRef = useRef<any>(null);

  /* ================= UI State ================= */
  const [isEditOpen, setEditOpen] = useState(false);
  const [isViewOpen, setViewOpen] = useState(false);
  const [viewRow, setViewRow] = useState<any>(null);
  const [editData, setEditData] = useState<any>(null);
  const [copyDisabled, setCopyDisabled] = useState(true);
  const [deleteDisabled, setDeleteDisabled] = useState(true);
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  /* ================= Meta ================= */
  const [headerMeta, setHeaderMeta] = useState<Record<string, HeaderMetaProps>>(
    {}
  );

  /* ================= Form Def ================= */
  const formDefs = useMemo<FormDef[]>(
    () =>
      Object.entries(headerMeta).map(([field, meta]) => ({
        field,
        ...meta,
        read_only: normalizeBoolean(meta.read_only),
      })),
    [headerMeta]
  );

  /* ================= Fetch Meta ================= */
  const fetchHeaderMeta = useCallback(async () => {
    setLoadingMeta(true);
    setMetaError(null);
    try {
      const res = await companyViewSet.options();
      setHeaderMeta(res?.actions?.POST ?? {});
    } catch (err: any) {
      console.error("Failed to load Company Meta:", err);
      setMetaError(err?.message || i18n.t("Failed to load metadata"));
    } finally {
      setLoadingMeta(false);
    }
  }, [companyViewSet, i18n]);

  useEffect(() => {
    fetchHeaderMeta();
  }, [fetchHeaderMeta]);

  /* ================= Actions ================= */
  const openCreate = () => {
    setEditData(null);
    setEditOpen(true);
  };

  const openView = (row: any) => {
    setViewRow(row);
    setViewOpen(true);
  };

  const openCopy = () => {
    const node = gridApiRef.current?.getSelectedNodes?.()[0];
    if (!node?.data) return;

    setEditData(buildCopyBase(node.data));
    setEditOpen(true);
  };

  const openDelete = () => {
    const node = gridApiRef.current?.getSelectedNodes?.()[0];
    if (!node?.data) return;

    const companyName = node.data.company_name || `ID: ${node.data.id}`;

    Modal.confirm({
      title: i18n.t("Are you sure to delete?"),
      content: `${i18n.t("Company Name")}: ${companyName}`,
      okText: i18n.t("Delete"),
      okType: "danger",
      cancelText: i18n.t("Cancel"),
      onOk: async () => {
        try {
          messageApi.open({
            key: "delete",
            type: "loading",
            content: i18n.t("Deleting..."),
            duration: 0,
          });

          await companyViewSet.delete({ id: node.data.id });

          messageApi.open({
            key: "delete",
            type: "success",
            content: i18n.t("Delete successfully"),
          });

          // Refresh table
          tableRef.current?.api?.refreshServerSide();

          // Close view drawer if the deleted item was being viewed
          if (viewRow?.id === node.data.id) {
            closeView();
          }
        } catch (err: any) {
          console.error("Delete failed:", err);
          messageApi.open({
            key: "delete",
            type: "error",
            content:
              err?.message ||
              err?.response?.data?.message ||
              i18n.t("Delete failed"),
          });
        }
      },
    });
  };

  /* ================= Close ================= */
  const closeView = () => {
    setViewOpen(false);
    setViewRow(null);
  };

  const closeEdit = (res?: any) => {
    setEditOpen(false);
    setEditData(null);

    if (res?.data) setViewRow(res.data);
  };

  /* ================= Success ================= */
  const handleCreateSuccess = (res?: any) => {
    if (!res) return;

    tableRef.current?.api?.refreshServerSide();
    setViewRow(res);
  };

  const handleUpdateSuccess = (res?: any) => {
    const api = tableRef.current?.api;
    if (!api) return;

    const updated = res;
    const node = api.getRowNode(String(updated.id));

    setViewRow(updated);

    if (node) {
      node.updateData(updated);
      api.ensureNodeVisible(node, "middle");
    } else {
      api.refreshServerSide({ route: [], purge: false });
    }
  };

  /* ================= Loading ================= */
  if (loadingMeta) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  if (metaError) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-500">{metaError}</Text>
      </View>
    );
  }

  /* ================= Render ================= */
  return (
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
        theme={myTableTheme}
        context={{ meta: headerMeta }}
        rowSelection={{ mode: "singleRow" }}
        onRowClicked={(e) => openView(e.data)}
        onGridReady={(params) => {
          gridApiRef.current = params.api;
        }}
        onSelectionChanged={(e) => {
          const selected = e.api.getSelectedNodes();
          const hasSelection = selected.length > 0;
          setCopyDisabled(!hasSelection);
          setDeleteDisabled(!hasSelection);
        }}
      />
    </View>
  );
}
