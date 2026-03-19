import React, { useMemo } from "react";
import i18n from "@/locale/i18n";
import { Text } from "@/components/sea-saw-design/text";
import {
  Card,
  Field,
  FieldGrid,
  ItemsTable,
} from "@/components/sea-saw-page/base";
import { convertToFormDefs } from "@/utils/formDefUtils";
import { useFieldHelpers } from "@/hooks/useFieldHelpers";
import RoleBadges from "./RoleBadges";

interface AccountCardProps {
  def?: any[];
  data?: Record<string, any> | null;
  onEdit?: (data: any) => void;
}

export default function AccountCard({ def, data, onEdit }: AccountCardProps) {
  const account = data ?? {};

  const formDefs = useMemo(() => convertToFormDefs(def), [def]);
  const { getFieldLabel } = useFieldHelpers(formDefs);

  const getFieldDef = (fieldName: string) =>
    formDefs.find((d) => d.field === fieldName);

  const contactsDef = getFieldDef("contacts")?.child?.children;

  return (
    <Card>
      <Card.Header
        code={account.id ? `#${account.id}` : undefined}
        statusValue={
          <Text className="text-base font-semibold text-slate-800 mt-1">
            {account.account_name || "???"}
          </Text>
        }
        rightContent={
          account.roles && account.roles.length > 0 ? (
            <RoleBadges roles={account.roles} />
          ) : undefined
        }
      />

      {/* Contact Information Section */}
      <Card.Section className="bg-slate-50/70">
        <Text className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          {i18n.t("basic information")}
        </Text>
        <FieldGrid>
          {["phone", "email", "address"].map((fieldName) => (
            <Field
              key={fieldName}
              label={getFieldLabel(fieldName)}
              value={account[fieldName]}
            />
          ))}
        </FieldGrid>
      </Card.Section>

      {/* Business Information Section */}
      <Card.Section>
        <Text className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          {i18n.t("business information")}
        </Text>
        <FieldGrid>
          {["industry", "website"].map((fieldName) => (
            <Field
              key={fieldName}
              label={getFieldLabel(fieldName)}
              value={account[fieldName]}
            />
          ))}
        </FieldGrid>
      </Card.Section>

      {/* Contacts Section */}
      {account.contacts && account.contacts.length > 0 && (
        <Card.Section>
          <Text className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            {getFieldLabel("contacts")}
          </Text>
          <ItemsTable
            def={contactsDef}
            value={account.contacts}
            excludeFields={["id", "pk", "account"]}
          />
        </Card.Section>
      )}

      {/* Footer: Metadata + Edit */}
      <Card.Footer
        metadata={account}
        canEdit={!!onEdit}
        onEdit={() => onEdit?.(account)}
      />
    </Card>
  );
}
