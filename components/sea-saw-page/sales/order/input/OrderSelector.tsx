import { forwardRef, useCallback } from "react";
import { View, Pressable } from "react-native";
import { Form, Tag } from "antd";
import {
  ShoppingCartIcon,
  CurrencyDollarIcon,
  XMarkIcon,
} from "react-native-heroicons/outline";

import i18n from "@/locale/i18n";
import EntitySelector, {
  EntityItem,
} from "@/components/sea-saw-design/selector/EntitySelector";
import type { ColDefinition } from "@/components/sea-saw-design/table/interface";
import { Text } from "@/components/sea-saw-design/text";
import { FormDef } from "@/hooks/useFormDefs";

export interface Order extends EntityItem {
  id: string | number;
  pk?: string | number;
  order_number?: string;
  order_date?: string;
  status?: string;
  status_display?: string;
  total_amount?: number;
  currency?: string;
  company_name?: string;
  contact_name?: string;
}

interface OrderSelectorProps {
  def?: FormDef;
  value?: Order | Order[] | null;
  onChange?: (v: Order | Order[] | null) => void;
  multiple?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  draft: "default",
  pending: "processing",
  confirmed: "blue",
  in_production: "orange",
  completed: "success",
  cancelled: "error",
  shipped: "cyan",
  delivered: "green",
};

const COLUMN_ORDER = [
  "id",
  "order_code",
  "order_date",
  "etd",
  "contact",
  "status",
  "loading_port",
  "destination_port",
  "shipment_term",
  "inco_terms",
  "currency",
  "deposit",
  "balance",
  "total_amount",
  "comment",
];

const COL_DEFINITIONS: Record<string, ColDefinition> = {
  contact_id: { skip: true },
  attachments: { skip: true },
  order_items: { skip: true },
  created_by: { skip: true },
  updated_by: { skip: true },
  created_at: { skip: true },
  updated_at: { skip: true },
};

const OrderSelector = forwardRef<View, OrderSelectorProps>(
  ({ def, value, onChange, multiple = false }, ref) => {
    const form = Form.useFormInstance();

    const renderSelectedChip = useCallback(
      (item: Order, onRemove: () => void) => {
        const status = item.status || "draft";
        const statusColor = STATUS_COLORS[status] || "default";

        return (
          <View className="flex-row items-center rounded-xl px-3 py-2 mr-2 mb-1 bg-indigo-50 border border-indigo-200">
            <View
              className="w-7 h-7 rounded-lg items-center justify-center mr-2"
              style={{ backgroundColor: "rgba(99, 102, 241, 0.15)" }}
            >
              <ShoppingCartIcon size={14} className="text-indigo-600" />
            </View>

            <View className="mr-2">
              <View className="flex-row items-center gap-2">
                <Text
                  className="text-sm font-semibold"
                  style={{ color: "#312e81", letterSpacing: -0.3 }}
                >
                  {item.order_number || `#${item.pk || item.id}`}
                </Text>
                <Tag
                  color={statusColor}
                  style={{
                    margin: 0,
                    fontSize: 10,
                    lineHeight: "16px",
                    padding: "0 6px",
                    borderRadius: 4,
                  }}
                >
                  {item.status_display || item.status}
                </Tag>
              </View>

              {(item.company_name || item.total_amount) && (
                <View className="flex-row items-center gap-3 mt-0.5">
                  {item.company_name && (
                    <Text className="text-xs text-gray-500">
                      {item.company_name}
                    </Text>
                  )}
                  {item.total_amount && (
                    <View className="flex-row items-center">
                      <CurrencyDollarIcon
                        size={12}
                        className="text-emerald-600 mr-0.5"
                      />
                      <Text className="text-xs font-medium text-emerald-600">
                        {item.currency || "USD"}{" "}
                        {Number(item.total_amount).toLocaleString()}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>

            {!def?.read_only && (
              <Pressable
                onPress={onRemove}
                className="ml-1 p-1 rounded-full hover:bg-red-50 active:bg-red-100"
              >
                <XMarkIcon size={14} className="text-indigo-300" />
              </Pressable>
            )}
          </View>
        );
      },
      [def?.read_only],
    );

    const mapResponseToItems = useCallback((response: any): Order[] => {
      return (response.results || []).map((item: any) => ({
        id: item.pk ?? item.id,
        pk: item.pk ?? item.id,
        order_number: item.order_number || "",
        order_date: item.order_date || "",
        status: item.status || "draft",
        status_display: item.status_display || item.status || "",
        total_amount: item.total_amount,
        currency: item.currency || "USD",
        company_name: item.company?.company_name || item.company_name || "",
        contact_name: item.contact?.name || item.contact_name || "",
      }));
    }, []);

    const handleChange = useCallback(
      (order: Order | Order[] | null) => {
        if (form) {
          if (multiple) {
            const orders = order as Order[] | null;
            form.setFieldsValue({
              order: orders,
              order_id: orders?.map((o) => o.id ?? o.pk),
            });
          } else {
            const singleOrder = order as Order | null;
            form.setFieldsValue({
              order: singleOrder,
              order_id: singleOrder?.id ?? singleOrder?.pk,
            });
          }
        }
        onChange?.(order);
      },
      [form, multiple, onChange],
    );

    return (
      <EntitySelector<Order>
        ref={ref}
        def={def}
        value={value}
        onChange={handleChange}
        multiple={multiple}
        contentType="order"
        colDefinitions={COL_DEFINITIONS}
        columnOrder={COLUMN_ORDER}
        displayField="order_number"
        searchPlaceholder={i18n.t("Search orders...")}
        title={i18n.t("Select Order")}
        mapResponseToItems={mapResponseToItems}
        renderSelectedChip={renderSelectedChip}
      />
    );
  },
);

OrderSelector.displayName = "OrderSelector";

export default OrderSelector;
