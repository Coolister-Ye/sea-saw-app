import React, { forwardRef, useCallback } from "react";
import { View } from "react-native";
import { Form } from "antd";

import EntitySelector from "@/components/sea-saw-design/selector/EntitySelector";
import i18n from "@/locale/i18n";

import { BankAccountChip } from "./BankAccountChip";
import type { BankAccount, BankAccountSelectorProps } from "./types";

export type { BankAccount, BankAccountSelectorProps } from "./types";

const BankAccountSelector = forwardRef<View, BankAccountSelectorProps>(
  (
    {
      def,
      value,
      onChange,
      fieldName = "bank_account",
      idFieldName = "bank_account_id",
      queryParams,
    },
    ref,
  ) => {
    const form = Form.useFormInstance();
    const readOnly = def?.read_only;
    const chipDef = def?.children;

    const renderSelectedChip = useCallback(
      (item: BankAccount, onRemove: () => void) => (
        <BankAccountChip
          item={item}
          def={chipDef}
          onRemove={onRemove}
          readOnly={readOnly}
        />
      ),
      [chipDef, readOnly],
    );

    const handleChange = useCallback(
      (val: BankAccount | BankAccount[] | null) => {
        const bankAccount = Array.isArray(val) ? val[0] ?? null : val;
        if (!form) {
          onChange?.(bankAccount);
          return;
        }

        form.setFieldsValue({
          [fieldName]: bankAccount,
          [idFieldName]: bankAccount?.id ?? bankAccount?.pk ?? null,
        });
        onChange?.(bankAccount);
      },
      [form, onChange, fieldName, idFieldName],
    );

    return (
      <EntitySelector<BankAccount>
        ref={ref}
        def={def}
        value={value}
        onChange={handleChange}
        multiple={false}
        contentType="bankAccount"
        displayField="bank_name"
        searchPlaceholder={i18n.t("Search bank account...")}
        title={i18n.t("Select Bank Account")}
        renderSelectedChip={renderSelectedChip}
        queryParams={queryParams}
      />
    );
  },
);

BankAccountSelector.displayName = "BankAccountSelector";

export default BankAccountSelector;
export { BankAccountSelector };
