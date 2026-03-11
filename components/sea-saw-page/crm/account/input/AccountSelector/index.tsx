import React, { forwardRef, useCallback } from "react";
import { View } from "react-native";
import { Form } from "antd";

import EntitySelector from "@/components/sea-saw-design/selector/EntitySelector";
import i18n from "@/locale/i18n";

import { AccountChip } from "./AccountChip";
import { COL_DEFINITIONS } from "./constants";
import type { Account, AccountApiResponse, AccountSelectorProps } from "./types";
import { mapResponseToItems } from "./utils";

export type { Account, AccountRole, AccountSelectorProps } from "./types";

const AccountSelector = forwardRef<View, AccountSelectorProps>(
  (
    {
      def,
      value,
      onChange,
      multiple = false,
      roleFilter,
      fieldName = "account",
      idFieldName = "account_id",
    },
    ref,
  ) => {
    const form = Form.useFormInstance();
    const readOnly = def?.read_only;
    const chipDef = def?.children;

    const renderSelectedChip = useCallback(
      (item: Account, onRemove: () => void) => (
        <AccountChip item={item} def={chipDef} onRemove={onRemove} readOnly={readOnly} />
      ),
      [chipDef, readOnly],
    );

    const handleMapResponse = useCallback(
      (response: AccountApiResponse) => mapResponseToItems(response),
      [],
    );

    const handleChange = useCallback(
      (account: Account | Account[] | null) => {
        if (!form) {
          onChange?.(account);
          return;
        }

        const fieldValues = multiple
          ? {
              [fieldName]: account,
              [idFieldName]: (account as Account[] | null)?.map((a) => a.id ?? a.pk),
            }
          : {
              [fieldName]: account,
              [idFieldName]: (account as Account | null)?.id ?? (account as Account | null)?.pk,
            };

        form.setFieldsValue(fieldValues);
        onChange?.(account);
      },
      [form, multiple, onChange, fieldName, idFieldName],
    );

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
        mapResponseToItems={handleMapResponse}
        renderSelectedChip={renderSelectedChip}
        queryParams={queryParams}
      />
    );
  },
);

AccountSelector.displayName = "AccountSelector";

export default AccountSelector;
export { AccountSelector };
