import React, { forwardRef, useCallback } from "react";
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
import { cn } from "@/lib/utils";
import i18n from "@/locale/i18n";

/* Types */
export type AccountRole = "CUSTOMER" | "SUPPLIER" | "PROSPECT";

export interface Account extends EntityItem {
  id: string | number;
  pk?: string | number;
  account_name: string;
  address?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  website?: string;
  industry?: string;
  description?: string;
  roles?: AccountRole[];
}

interface AccountSelectorProps {
  def?: FormDef;
  value?: Account | Account[] | null;
  onChange?: (v: Account | Account[] | null) => void;
  multiple?: boolean;
  roleFilter?: "customer" | "supplier" | "prospect";
}

interface AccountApiResponse {
  results: Array<{
    pk?: string | number;
    id?: string | number;
    account_name?: string;
    address?: string;
    phone?: string;
    mobile?: string;
    email?: string;
    website?: string;
    industry?: string;
    description?: string;
    roles?: AccountRole[];
  }>;
}

/* Column definitions - skip timestamp fields */
const COL_DEFINITIONS: Record<string, ColDefinition> = {
  created_at: { skip: true },
  updated_at: { skip: true },
  roles: { skip: true }, // Roles will be shown in chip, not in table
};

/** Role badge colors */
const ROLE_COLORS: Record<AccountRole, { bg: string; border: string; text: string }> = {
  CUSTOMER: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
  SUPPLIER: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700" },
  PROSPECT: { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-600" },
};

/** Get role colors with fallback */
const getRoleColors = (role?: AccountRole) => {
  return ROLE_COLORS[role || "PROSPECT"];
};

const AccountSelector = forwardRef<View, AccountSelectorProps>(
  ({ def, value, onChange, multiple = false, roleFilter }, ref) => {
    const form = Form.useFormInstance();
    const readOnly = def?.read_only;

    /** Custom chip renderer with role badges */
    const renderSelectedChip = useCallback(
      (item: Account, onRemove: () => void) => {
        const roles = item.roles || [];
        const primaryRole = roles[0];
        const colors = getRoleColors(primaryRole);

        return (
          <View
            className={cn(
              "flex-row items-center justify-center rounded border px-3 py-1.5 mr-2",
              colors.bg,
              colors.border
            )}
          >
            <BuildingOfficeIcon size={14} className={cn("mr-2", colors.text)} />

            <View className="flex-1 justify-center">
              <View className="flex-row items-center">
                <Text className={cn("text-sm font-semibold", colors.text)}>
                  {item.account_name}
                </Text>
                {roles.length > 0 && (
                  <View className="flex-row ml-2">
                    {roles.map((role) => {
                      const roleColors = getRoleColors(role);
                      return (
                        <View
                          key={role}
                          className={cn(
                            "px-1.5 py-0.5 rounded-sm ml-1",
                            roleColors.bg
                          )}
                        >
                          <Text className={cn("text-xs", roleColors.text)}>
                            {i18n.t(role)}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>

              {item.address && (
                <View className="flex-row items-center mt-0.5">
                  <MapPinIcon size={10} className={cn("mr-1", colors.text)} />
                  <Text
                    className={cn("text-xs", colors.text)}
                    numberOfLines={1}
                  >
                    {item.address}
                  </Text>
                </View>
              )}
            </View>

            {!readOnly && (
              <Pressable
                onPress={onRemove}
                className="ml-1.5 p-0.5 rounded-full active:opacity-70"
              >
                <XMarkIcon size={14} className={colors.text} />
              </Pressable>
            )}
          </View>
        );
      },
      [readOnly]
    );

    /** Map API response to Account items */
    const mapResponseToItems = useCallback((response: AccountApiResponse): Account[] => {
      return response.results.map((item) => ({
        id: item.pk ?? item.id ?? "",
        pk: item.pk ?? item.id,
        account_name: item.account_name ?? "",
        address: item.address,
        phone: item.phone,
        mobile: item.mobile,
        email: item.email,
        website: item.website,
        industry: item.industry,
        description: item.description,
        roles: item.roles,
      }));
    }, []);

    /** Handle selection change and sync form fields */
    const handleChange = useCallback(
      (account: Account | Account[] | null) => {
        if (!form) {
          onChange?.(account);
          return;
        }

        const fieldValues = multiple
          ? {
              account,
              account_id: (account as Account[] | null)?.map((a) => a.id ?? a.pk),
            }
          : {
              account,
              account_id: (account as Account | null)?.id ?? (account as Account | null)?.pk,
            };

        form.setFieldsValue(fieldValues);
        onChange?.(account);
      },
      [form, multiple, onChange],
    );

    /** Build query params for role filtering */
    const queryParams = roleFilter ? { role: roleFilter } : undefined;

    return (
      <EntitySelector<Account>
        ref={ref}
        def={def}
        value={value}
        onChange={handleChange}
        multiple={multiple}
        contentType="account"
        colDefinitions={COL_DEFINITIONS}
        displayField="account_name"
        searchPlaceholder={i18n.t("Search account...")}
        title={i18n.t("Select Account")}
        mapResponseToItems={mapResponseToItems}
        renderSelectedChip={renderSelectedChip}
        queryParams={queryParams}
      />
    );
  },
);

AccountSelector.displayName = "AccountSelector";

export default AccountSelector;
export { AccountSelector };
