import React, { forwardRef, useCallback } from "react";
import { View, Pressable } from "react-native";
import { Form } from "antd";
import { BuildingLibraryIcon, XMarkIcon } from "react-native-heroicons/outline";

import EntitySelector from "@/components/sea-saw-design/selector/EntitySelector";
import { Text } from "@/components/sea-saw-design/text";
import { BankAccountPopover } from "@/components/sea-saw-page/crm/bank-account/display";
import i18n from "@/locale/i18n";

interface BankAccount {
  id?: number;
  pk?: number;
  bank_name?: string;
  account_number?: string;
  currency?: string;
  is_primary?: boolean;
}

interface BankAccountSelectorProps {
  def?: any;
  value?: BankAccount | null;
  onChange?: (value: BankAccount | null) => void;
  fieldName?: string;
  idFieldName?: string;
  queryParams?: Record<string, any>;
}

function BankAccountChip({
  item,
  def,
  onRemove,
  readOnly,
}: {
  item: BankAccount;
  def?: Record<string, any>;
  onRemove: () => void;
  readOnly?: boolean;
}) {
  return (
    <BankAccountPopover value={item} def={def}>
      <View className="flex-row items-center rounded border border-blue-200 bg-blue-50 px-3 py-1 mr-2">
        <BuildingLibraryIcon size={14} className="mr-2 text-blue-600" />
        <Text className="text-sm font-semibold text-blue-700">
          {item.bank_name}
        </Text>
        {item.currency && (
          <Text className="text-xs text-blue-500 ml-1.5">({item.currency})</Text>
        )}
        {!readOnly && (
          <Pressable
            onPress={onRemove}
            className="ml-1.5 p-0.5 rounded-full active:opacity-70 hover:bg-gray-200"
          >
            <XMarkIcon size={14} className="text-blue-600" />
          </Pressable>
        )}
      </View>
    </BankAccountPopover>
  );
}

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
      (bankAccount: BankAccount | null) => {
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
