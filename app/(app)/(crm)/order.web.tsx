import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import "@/css/tableStyle.css";
import { View, ActivityIndicator } from "react-native";

import { HeaderMetaProps } from "@/components/sea-saw-design/table/interface";
import { useLocale } from "@/context/Locale";
import useDataService from "@/hooks/useDataService";
import { FormDef } from "@/hooks/useFormDefs";
import { normalizeBoolean } from "@/utlis/commonUtils";

import { Text } from "@/components/ui/text";
import Table from "@/components/sea-saw-design/table";
import { myTableTheme } from "@/components/sea-saw-design/table/tableTheme";

import ContactRender from "@/components/sea-saw-page/crm/table/render/ContactRender";
import OrderItemsRender from "@/components/sea-saw-page/crm/table/render/OrderItemsRender";
import ProductionOrderRender from "@/components/sea-saw-page/crm/table/render/ProductionOrderRender";
import OutboundOrdersRender from "@/components/sea-saw-page/crm/table/render/OutboundOrdersRender";
import PaymentsRender from "@/components/sea-saw-page/crm/table/render/PaymentsRender";

import OrderInput from "@/components/sea-saw-page/crm/from/input/OrderInput";
import OrderDisplay from "@/components/sea-saw-page/crm/from/display/OrderDisplay";
import ActionDropdown from "@/components/sea-saw-page/crm/common/ActionDropdown";
import OrderStatusRender from "@/components/sea-saw-page/crm/table/render/OrderStatusRender";

/* ========================
 * Utils
 * ======================== */

/** 深度移除 id / pk（用于 copy -> create） */
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

function buildCopyBase(order: any) {
  if (!order) return null;
  const {
    id,
    pk,
    created_at,
    updated_at,
    production_orders,
    outbound_orders,
    payments,
    ...rest
  } = order;
  return stripIdsDeep(rest);
}

/* ========================
 * Component
 * ======================== */

export default function OrderScreen() {
  const { i18n } = useLocale();
  const { options } = useDataService();

  const tableRef = useRef<any>(null);
  const gridApiRef = useRef<any>(null);

  /* ================= UI State ================= */
  const [isEditOpen, setEditOpen] = useState(false);
  const [isViewOpen, setViewOpen] = useState(false);
  const [viewRow, setViewRow] = useState<any>(null);
  const [editData, setEditData] = useState<any>(null);
  const [copyDisabled, setCopyDisabled] = useState(true);
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [metaError, setMetaError] = useState<string | null>(null);

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

  /* ================= Defs 拆分 ================= */
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
      order_items: { cellRenderer: OrderItemsRender },
      production_orders: { cellRenderer: ProductionOrderRender },
      outbound_orders: { cellRenderer: OutboundOrdersRender },
      payments: { cellRenderer: PaymentsRender },
      status: { cellRenderer: OrderStatusRender },
    }),
    []
  );

  /* ================= Fetch Meta ================= */
  const fetchHeaderMeta = useCallback(async () => {
    setLoadingMeta(true);
    setMetaError(null);
    try {
      const res = await options({ contentType: "order" });
      setHeaderMeta(res?.actions?.POST ?? {});
    } catch (err: any) {
      console.error("加载 Order Meta 失败:", err);
      setMetaError(err?.message || i18n.t("Failed to load metadata"));
    } finally {
      setLoadingMeta(false);
    }
  }, [options, i18n]);

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
    if (!res?.status) return;

    tableRef.current?.api?.refreshServerSide();
    setViewRow(res.data);
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
      {/* Top Actions */}
      <View className="flex-row justify-end gap-1 p-1 py-1.5">
        <ActionDropdown
          openCreate={openCreate}
          openCopy={openCopy}
          copyDisabled={copyDisabled}
        />
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
        onGridReady={(params) => {
          gridApiRef.current = params.api;
        }}
        onSelectionChanged={(e) => {
          const selected = e.api.getSelectedNodes();
          setCopyDisabled(selected.length === 0);
        }}
      />
    </View>
  );
}
