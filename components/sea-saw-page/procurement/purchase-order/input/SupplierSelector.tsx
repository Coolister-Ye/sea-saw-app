import { forwardRef, useCallback } from "react";
import { View, Pressable } from "react-native";
import { Form, Tag } from "antd";
import {
  TruckIcon,
  BuildingOfficeIcon,
  XMarkIcon,
} from "react-native-heroicons/outline";

import i18n from "@/locale/i18n";
import EntitySelector, {
  EntityItem,
} from "@/components/sea-saw-design/selector/EntitySelector";
import type { ColDefinition } from "@/components/sea-saw-design/table/interface";
import { Text } from "@/components/sea-saw-design/text";
import { FormDef } from "@/hooks/useFormDefs";

export interface Supplier extends EntityItem {
  id: string | number;
  pk?: string | number;
  supplier_code?: string;
  name?: string;
  company_name?: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  is_active?: boolean;
}

interface SupplierSelectorProps {
  def?: FormDef;
  value?: Supplier | Supplier[] | null;
  onChange?: (v: Supplier | Supplier[] | null) => void;
  multiple?: boolean;
  fieldName?: string;
  idFieldName?: string;
}

const COLUMN_ORDER = [
  "id",
  "supplier_code",
  "name",
  "contact_name",
  "phone",
  "email",
  "address",
  "is_active",
];

const COL_DEFINITIONS: Record<string, ColDefinition> = {
  created_by: { skip: true },
  updated_by: { skip: true },
  created_at: { skip: true },
  updated_at: { skip: true },
};

const SupplierSelector = forwardRef<View, SupplierSelectorProps>(
  (
    {
      def,
      value,
      onChange,
      multiple = false,
      fieldName = "supplier",
      idFieldName = "supplier_id",
    },
    ref,
  ) => {
    const form = Form.useFormInstance();

    const renderSelectedChip = useCallback(
      (item: Supplier, onRemove: () => void) => {
        const isActive = item.is_active !== false;
        const statusColor = isActive ? "success" : "default";

        return (
          <View className="flex-row items-center rounded-xl px-3 py-2 mr-2 mb-1 bg-purple-50 border border-purple-200">
            <View
              className="w-7 h-7 rounded-lg items-center justify-center mr-2"
              style={{ backgroundColor: "rgba(147, 51, 234, 0.15)" }}
            >
              <TruckIcon size={14} className="text-purple-600" />
            </View>

            <View className="mr-2">
              <View className="flex-row items-center gap-2">
                <Text
                  className="text-sm font-semibold"
                  style={{ color: "#581c87", letterSpacing: -0.3 }}
                >
                  {item.supplier_code || item.name || `#${item.pk || item.id}`}
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
                  {isActive ? i18n.t("Active") : i18n.t("Inactive")}
                </Tag>
              </View>

              {(item.company_name || item.contact_name) && (
                <View className="flex-row items-center gap-3 mt-0.5">
                  {item.company_name && (
                    <View className="flex-row items-center">
                      <BuildingOfficeIcon
                        size={12}
                        className="text-gray-500 mr-0.5"
                      />
                      <Text className="text-xs text-gray-500">
                        {item.company_name}
                      </Text>
                    </View>
                  )}
                  {item.contact_name && (
                    <Text className="text-xs text-gray-500">
                      {item.contact_name}
                    </Text>
                  )}
                </View>
              )}
            </View>

            {!def?.read_only && (
              <Pressable
                onPress={onRemove}
                className="ml-1 p-1 rounded-full hover:bg-red-50 active:bg-red-100"
              >
                <XMarkIcon size={14} className="text-purple-300" />
              </Pressable>
            )}
          </View>
        );
      },
      [def?.read_only],
    );

    const mapResponseToItems = useCallback((response: any): Supplier[] => {
      return (response.results || [])
        .filter((item: any) => item.is_active !== false)
        .map((item: any) => ({
          id: item.pk ?? item.id,
          pk: item.pk ?? item.id,
          supplier_code: item.supplier_code || "",
          name: item.name || "",
          company_name: item.company_name || item.name || "",
          contact_name: item.contact_name || "",
          phone: item.phone || "",
          email: item.email || "",
          address: item.address || "",
          is_active: item.is_active !== false,
        }));
    }, []);

    const handleChange = useCallback(
      (supplier: Supplier | Supplier[] | null) => {
        if (form) {
          if (multiple) {
            const suppliers = supplier as Supplier[] | null;
            form.setFieldsValue({
              [fieldName]: suppliers,
              [idFieldName]: suppliers?.map((s) => s.id ?? s.pk),
            });
          } else {
            const singleSupplier = supplier as Supplier | null;
            form.setFieldsValue({
              [fieldName]: singleSupplier,
              [idFieldName]: singleSupplier?.id ?? singleSupplier?.pk,
            });
          }
        }
        onChange?.(supplier);
      },
      [form, multiple, onChange, fieldName, idFieldName],
    );

    return (
      <EntitySelector<Supplier>
        ref={ref}
        def={def}
        value={value}
        onChange={handleChange}
        multiple={multiple}
        contentType="supplier"
        colDefinitions={COL_DEFINITIONS}
        columnOrder={COLUMN_ORDER}
        displayField="name"
        searchPlaceholder={i18n.t("Search suppliers...")}
        title={i18n.t("Select Supplier")}
        mapResponseToItems={mapResponseToItems}
        renderSelectedChip={renderSelectedChip}
      />
    );
  },
);

SupplierSelector.displayName = "SupplierSelector";

export default SupplierSelector;
