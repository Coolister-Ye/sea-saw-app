import React, { forwardRef, useCallback } from "react";
import { ColDef } from "ag-grid-community";
import { View } from "react-native";
import { Form } from "antd";

import EntitySelector, {
  EntityItem,
  EntitySelectorProps,
} from "@/components/sea-saw-design/selector/EntitySelector";
import { useLocale } from "@/context/Locale";
import { Text } from "@/components/ui/text";
import { FormDef } from "@/hooks/useFormDefs";

/* ========================
 * Types
 * ======================== */
export interface Company extends EntityItem {
  id: string | number;
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

/* ========================
 * Component
 * ======================== */
const CompanySelector = forwardRef<HTMLDivElement, CompanySelectorProps>(
  ({ def, value, onChange, multiple = false }, ref) => {
    const { i18n } = useLocale();
    const form = Form.useFormInstance();

  /* ========================
   * Column Definitions
   * ======================== */
  const columns: ColDef[] = [
    {
      field: "pk",
      headerName: "ID",
      width: 80,
      filter: false,
    },
    {
      field: "company_name",
      headerName: i18n.t("Company Name"),
      flex: 1,
      filter: "agTextColumnFilter",
    },
    {
      field: "address",
      headerName: i18n.t("Address"),
      flex: 1,
      filter: "agTextColumnFilter",
    },
    {
      field: "phone",
      headerName: i18n.t("Phone"),
      width: 150,
      filter: false,
    },
  ];

  /* ========================
   * Custom chip renderer
   * ======================== */
  const renderSelectedChip = (item: Company, onRemove: () => void) => (
    <View className="flex-row items-center bg-blue-50 border border-blue-200 rounded px-2 py-0.5">
      <View className="mr-1">
        <Text className="text-sm font-medium text-blue-900">
          {item.company_name}
        </Text>
        {item.address && (
          <Text className="text-xs text-blue-600">{item.address}</Text>
        )}
      </View>
      {!def?.read_only && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="text-blue-400 hover:text-blue-600 text-sm ml-1"
        >
          ×
        </button>
      )}
    </View>
  );

  /* ========================
   * Map response to items
   * ======================== */
  const mapResponseToItems = (response: any): Company[] => {
    return (response.results || []).map((item: any) => ({
      id: item.pk ?? item.id,
      pk: item.pk ?? item.id,
      company_name: item.company_name || "",
      address: item.address || "",
      phone: item.phone || "",
      email: item.email || "",
    }));
  };

  /* ========================
   * Handle onChange with dual field update
   * ======================== */
  const handleChange = useCallback(
    (company: Company | Company[] | null) => {
      // Update both company and company_id fields in form
      if (form) {
        if (multiple) {
          const companies = company as Company[] | null;
          form.setFieldsValue({
            company: companies,
            company_id: companies?.map(c => c.id ?? c.pk),
          });
        } else {
          const singleCompany = company as Company | null;
          form.setFieldsValue({
            company: singleCompany,
            company_id: singleCompany?.id ?? singleCompany?.pk,
          });
        }
      }
      // Call parent onChange
      onChange?.(company);
    },
    [form, multiple, onChange]
  );

    return (
      <EntitySelector<Company>
        ref={ref}
        def={def}
        value={value}
        onChange={handleChange}
        multiple={multiple}
        contentType="company"
        columns={columns}
        displayField="company_name"
        searchPlaceholder={i18n.t("Search company...")}
        title={i18n.t("Select Company")}
        mapResponseToItems={mapResponseToItems}
        renderSelectedChip={renderSelectedChip}
      />
    );
  }
);

CompanySelector.displayName = "CompanySelector";

export default CompanySelector;
export { CompanySelector };
