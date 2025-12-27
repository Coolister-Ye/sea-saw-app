import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import "@/css/tableStyle.css";
import { View, ActivityIndicator } from "react-native";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { HeaderMetaProps } from "@/components/sea-saw-design/table/interface";

import { useLocale } from "@/context/Locale";
import useDataService from "@/hooks/useDataService";
import { FormDef } from "@/hooks/useFormDefs";
import { normalizeBoolean } from "@/utlis/commonUtils";

import Table from "@/components/sea-saw-design/table";
import ContactRender from "@/components/sea-saw-page/crm/table/render/ContactRender";

import OrderInput from "@/components/sea-saw-page/crm/from/input/OrderInput";
import OrderDisplay from "@/components/sea-saw-page/crm/from/display/OrderDisplay";
import { myTableTheme } from "@/components/sea-saw-design/table/tableTheme";

/* ========================
 * 构造 Copy 用的 Order base 数据
 * ======================== */
function buildCopyBase(order: any) {
  if (!order) return null;

  const {
    id,
    pk,
    production_orders,
    outbound_orders,
    payments,
    created_at,
    updated_at,
    ...base
  } = order;

  return base;
}

export default function OrderScreen() {
  const { i18n } = useLocale();
  const { options } = useDataService();

  const tableRef = useRef<any>(null);
  const [gridApi, setGridApi] = useState<any>(null);

  /* ================= UI State ================= */
  const [isEditOpen, setEditOpen] = useState(false);
  const [isViewOpen, setViewOpen] = useState(false);

  /** 查看用数据 */
  const [viewRow, setViewRow] = useState<any>(null);

  /** 编辑 / 新建 / 复制 用数据 */
  const [editData, setEditData] = useState<any>(null);

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

  /* ======================== defs 拆分 ======================== */
  const defs = useMemo(() => {
    const pick = (field: string) => formDefs.find((d) => d.field === field);

    return {
      base: formDefs.filter(
        (d) =>
          !["production_orders", "outbound_orders", "payments"].includes(
            d.field
          )
      ),
      productionOrders: pick("production_orders"),
      outboundOrders: pick("outbound_orders"),
      payments: pick("payments"),
    };
  }, [formDefs]);

  /* ================= Column Renderers ================= */
  const colRenderers = useMemo(
    () => ({
      contact: { cellRenderer: ContactRender },
    }),
    []
  );

  /* ================= Fetch Meta ================= */
  const fetchHeaderMeta = useCallback(async () => {
    try {
      const res = await options({ contentType: "order" });
      if (res?.status) {
        setHeaderMeta(res.data.actions?.POST ?? {});
      }
    } catch (err) {
      console.error("加载 Order Meta 失败:", err);
    }
  }, [options]);

  useEffect(() => {
    fetchHeaderMeta();
  }, [fetchHeaderMeta]);

  /* ================= Open Handlers ================= */

  /** 新建 */
  const openCreate = () => {
    setEditData(null);
    setEditOpen(true);
  };

  /** 查看 */
  const openView = (row: any) => {
    setViewRow(row);
    setViewOpen(true);
  };

  /** 复制（来自表格选中行） */
  const openCopy = () => {
    const node = gridApi?.getSelectedNodes?.()[0];
    if (!node?.data) return;

    setEditData(buildCopyBase(node.data));
    setEditOpen(true);
  };

  /* ================= Close ================= */

  const closeView = () => {
    setViewRow(null);
    setViewOpen(false);
  };

  const closeEdit = (res?: any) => {
    setEditOpen(false);
    setEditData(null);

    if (res?.data) {
      setViewRow(res.data);
    }
  };

  /* ================= Success Handlers ================= */

  const handleCreateSuccess = (res?: any) => {
    if (!res?.status) return;

    tableRef.current?.api?.refreshServerSide();
    setViewRow(res.data);
  };

  const handleUpdateSuccess = (res?: any) => {
    if (!res?.status || !res.data) return;

    const api = tableRef.current?.api;
    if (!api) return;

    const updated = res.data;
    const node = api.getRowNode(String(updated.pk));

    setViewRow(updated);

    if (node) {
      node.updateData(updated);
      api.ensureNodeVisible(node, "middle");
    } else {
      api.refreshServerSide({ route: [], purge: false });
    }
  };

  /* ================= Loading ================= */
  if (!Object.keys(headerMeta).length) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  /* ================= Render ================= */
  return (
    <View className="flex-1 bg-white">
      {/* Top Actions */}
      <View className="p-2 flex-row justify-end gap-2">
        <Button onPress={openCreate}>
          <Text>{i18n.t("create")}</Text>
        </Button>
        <Button onPress={openCopy}>
          <Text>{i18n.t("copy")}</Text>
        </Button>
      </View>

      {/* Create / Copy Drawer */}
      <OrderInput
        isOpen={isEditOpen}
        def={defs.base}
        data={editData}
        onClose={closeEdit}
        onCreate={handleCreateSuccess}
        onUpdate={handleUpdateSuccess}
      />

      {/* View Drawer */}
      <OrderDisplay
        isOpen={isViewOpen}
        def={formDefs}
        data={viewRow}
        onClose={closeView}
        onUpdate={handleUpdateSuccess}
      />

      {/* Table */}
      <Table
        ref={tableRef}
        table="order"
        headerMeta={headerMeta}
        theme={myTableTheme}
        colDefinitions={colRenderers}
        context={{ meta: headerMeta }}
        rowSelection={{ mode: "singleRow" }}
        onRowClicked={(e) => openView(e.data)}
        onGridReady={(params) => setGridApi(params.api)}
      />
    </View>
  );
}
