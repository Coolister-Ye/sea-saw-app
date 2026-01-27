import React from "react";
import i18n from "@/locale/i18n";
import { View } from "react-native";
import { Tag } from "antd";

import EntitySelector, {
  EntityItem,
} from "@/components/sea-saw-design/selector/EntitySelector";
import { Text } from "@/components/sea-saw-design/text";
import { FormDef } from "@/hooks/useFormDefs";
import type { ColDefinition } from "@/components/sea-saw-design/table/interface";

/* ========================
 * Types
 * ======================== */
export interface Order extends EntityItem {
  id: string | number;
  order_code: string;
  status?: string;
  order_date?: string;
  delivery_date?: string;
  total_amount?: string | number;
}

interface ProductionRelatedOrderSelectorProps {
  def?: FormDef;
  value?: Order | Order[] | null;
  onChange?: (v: Order | Order[] | null) => void;
  multiple?: boolean;
}

/* ========================
 * Status color mapping
 * ======================== */
const getStatusColor = (status?: string): string => {
  const colorMap: Record<string, string> = {
    draft: "default",
    confirmed: "blue",
    in_production: "processing",
    shipped: "cyan",
    delivered: "success",
    cancelled: "error",
  };
  return colorMap[status || ""] || "default";
};

/* ========================
 * Component
 * ======================== */
export default function ProductionRelatedOrderSelector({
  def,
  value,
  onChange,
  multiple = false,
}: ProductionRelatedOrderSelectorProps) {
  /* ========================
   * Column Definitions
   * ======================== */
  const colDefinitions: Record<string, ColDefinition> = {
    pk: {
      headerName: "ID",
      width: 80,
      filter: false,
    },
    order_code: {
      headerName: i18n.t("Order Code"),
      flex: 1,
      filter: "agTextColumnFilter",
    },
    status: {
      headerName: i18n.t("Status"),
      width: 120,
      filter: "agSetColumnFilter",
      cellRenderer: (params: any) => {
        const status = params.value;
        return <Tag color={getStatusColor(status)}>{status || "-"}</Tag>;
      },
    },
    order_date: {
      headerName: i18n.t("Order Date"),
      width: 120,
      filter: "agDateColumnFilter",
    },
    total_amount: {
      headerName: i18n.t("Total Amount"),
      width: 120,
      filter: "agNumberColumnFilter",
    },
  };

  const columnOrder = ["pk", "order_code", "status", "order_date", "total_amount"];

  /* ========================
   * Custom chip renderer
   * ======================== */
  const renderSelectedChip = (item: Order, onRemove: () => void) => (
    <View className="flex-row items-center bg-green-50 border border-green-200 rounded px-2 py-0.5">
      <View className="mr-1">
        <Text className="text-sm font-medium text-green-900">
          {item.order_code}
        </Text>
        {item.status && (
          <Text className="text-xs text-green-600">{item.status}</Text>
        )}
      </View>
      {!def?.read_only && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="text-green-400 hover:text-green-600 text-sm ml-1"
        >
          ×
        </button>
      )}
    </View>
  );

  /* ========================
   * Map response to items
   * ======================== */
  const mapResponseToItems = (response: any): Order[] => {
    return (response.results || []).map((item: any) => ({
      id: item.pk ?? item.id,
      pk: item.pk ?? item.id,
      order_code: item.order_code || "",
      status: item.status || "",
      order_date: item.order_date || "",
      delivery_date: item.delivery_date || "",
      total_amount: item.total_amount || "",
    }));
  };

  return (
    <EntitySelector<Order>
      def={def}
      value={value}
      onChange={onChange}
      multiple={multiple}
      contentType="order"
      colDefinitions={colDefinitions}
      columnOrder={columnOrder}
      displayField="order_code"
      searchPlaceholder={i18n.t("Search order...")}
      title={i18n.t("Select Order")}
      mapResponseToItems={mapResponseToItems}
      renderSelectedChip={renderSelectedChip}
    />
  );
}

export { ProductionRelatedOrderSelector };
