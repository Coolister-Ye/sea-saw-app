import React, { useMemo } from "react";
import i18n from "@/locale/i18n";
import { Text } from "@/components/sea-saw-design/text";
import { Card, Field, FieldGrid } from "@/components/sea-saw-page/base";
import { convertToFormDefs } from "@/utils/formDefUtils";
import { useFieldHelpers } from "@/hooks/useFieldHelpers";
import Tag from "@/components/sea-saw-design/tag";

interface BankAccountCardProps {
  def?: any[];
  data?: Record<string, any> | null;
  onEdit?: (data: any) => void;
}

export default function BankAccountCard({
  def,
  data,
  onEdit,
}: BankAccountCardProps) {
  const bankAccount = data ?? {};

  const formDefs = useMemo(() => convertToFormDefs(def), [def]);
  const { getFieldLabel } = useFieldHelpers(formDefs);

  return (
    <Card>
      <Card.Header
        code={bankAccount.id ? `#${bankAccount.id}` : undefined}
        statusValue={
          <Text className="text-base font-semibold text-slate-800">
            {bankAccount.bank_name || "—"}
          </Text>
        }
      />

      {/* Bank Info */}
      <Card.Section className="bg-slate-50/70">
        <Text className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          {i18n.t("basic information")}
        </Text>
        <FieldGrid>
          {["account_number", "account_holder", "currency"].map((fieldName) => (
            <Field
              key={fieldName}
              label={getFieldLabel(fieldName)}
              value={bankAccount[fieldName]}
            />
          ))}
        </FieldGrid>
      </Card.Section>

      {/* Bank Details */}
      <Card.Section>
        <Text className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          {i18n.t("bank details")}
        </Text>
        <FieldGrid>
          {["swift_code", "branch", "bank_address"].map((fieldName) => (
            <Field
              key={fieldName}
              label={getFieldLabel(fieldName)}
              value={bankAccount[fieldName]}
            />
          ))}
          {bankAccount.is_primary && (
            <Field
              label={getFieldLabel("is_primary")}
              value={<Tag color="green">{i18n.t("Primary")}</Tag>}
            />
          )}
        </FieldGrid>
      </Card.Section>

      {bankAccount.remark && (
        <Card.Section>
          <Field label={getFieldLabel("remark")} value={bankAccount.remark} />
        </Card.Section>
      )}

      <Card.Footer
        metadata={bankAccount}
        canEdit={!!onEdit}
        onEdit={() => onEdit?.(bankAccount)}
      />
    </Card>
  );
}
