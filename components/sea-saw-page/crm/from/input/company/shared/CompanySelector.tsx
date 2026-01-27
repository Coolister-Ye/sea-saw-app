import React, { forwardRef, useCallback } from "react";
import i18n from "@/locale/i18n";
import { View, Pressable } from "react-native";
import { Form } from "antd";
import {
  BuildingOfficeIcon,
  MapPinIcon,
  XMarkIcon,
} from "react-native-heroicons/outline";

import EntitySelector, {
  type EntityItem,
} from "@/components/sea-saw-design/selector/EntitySelector";
import type { ColDefinition } from "@/components/sea-saw-design/table/interface";
import { Text } from "@/components/sea-saw-design/text";
import type { FormDef } from "@/hooks/useFormDefs";

/* Types */
export interface Company extends EntityItem {
  id: string | number;
  pk?: string | number;
  company_name: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface CompanySelectorProps {
  def?: FormDef;
  value?: Company | Company[] | null;
  onChange?: (v: Company | Company[] | null) => void;
  multiple?: boolean;
}

/* Column definitions - skip timestamp fields */
const COL_DEFINITIONS: Record<string, ColDefinition> = {
  created_at: { skip: true },
  updated_at: { skip: true },
};

const CompanySelector = forwardRef<View, CompanySelectorProps>(
  ({ def, value, onChange, multiple = false }, ref) => {
    const form = Form.useFormInstance();
    const readOnly = def?.read_only;

    /** Custom chip renderer */
    const renderSelectedChip = useCallback(
      (item: Company, onRemove: () => void) => (
        <View className="flex-row items-center rounded px-3 mr-2 bg-sky-50 border border-sky-200">
          <View className="w-3 h-3 rounded-lg items-center justify-center mr-2">
            <BuildingOfficeIcon size={14} className="text-sky-600" />
          </View>

          <View className="mr-2">
            <Text className="text-sm font-semibold text-sky-800">
              {item.company_name}
            </Text>

            {item.address && (
              <View className="flex-row items-center mt-0.5">
                <MapPinIcon size={10} className="text-sky-400 mr-1" />
                <Text className="text-xs text-sky-600" numberOfLines={1}>
                  {item.address}
                </Text>
              </View>
            )}
          </View>

          {!readOnly && (
            <XMarkIcon size={14} className="text-sky-300 hover:text-red-300" />
          )}
        </View>
      ),
      [readOnly],
    );

    /** Map API response to Company items */
    const mapResponseToItems = useCallback((response: any): Company[] => {
      return (response.results || []).map((item: any) => ({
        id: item.pk ?? item.id,
        pk: item.pk ?? item.id,
        company_name: item.company_name || "",
        address: item.address || "",
        phone: item.phone || "",
        email: item.email || "",
      }));
    }, []);

    /** Handle selection change and sync form fields */
    const handleChange = useCallback(
      (company: Company | Company[] | null) => {
        if (form) {
          if (multiple) {
            const companies = company as Company[] | null;
            form.setFieldsValue({
              company: companies,
              company_id: companies?.map((c) => c.id ?? c.pk),
            });
          } else {
            const singleCompany = company as Company | null;
            form.setFieldsValue({
              company: singleCompany,
              company_id: singleCompany?.id ?? singleCompany?.pk,
            });
          }
        }
        onChange?.(company);
      },
      [form, multiple, onChange],
    );

    return (
      <EntitySelector<Company>
        ref={ref}
        def={def}
        value={value}
        onChange={handleChange}
        multiple={multiple}
        contentType="company"
        colDefinitions={COL_DEFINITIONS}
        displayField="company_name"
        searchPlaceholder={i18n.t("Search company...")}
        title={i18n.t("Select Company")}
        mapResponseToItems={mapResponseToItems}
        renderSelectedChip={renderSelectedChip}
      />
    );
  },
);

CompanySelector.displayName = "CompanySelector";

export default CompanySelector;
export { CompanySelector };
