import React, { useMemo } from "react";
import { View } from "react-native";
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
import Tag from "@/components/sea-saw-design/tag";

interface ContactCardProps {
  def?: any[];
  data?: Record<string, any> | null;
  onEdit?: (data: any) => void;
}

export default function ContactCard({ def, data, onEdit }: ContactCardProps) {
  const contact = data ?? {};

  const formDefs = useMemo(() => convertToFormDefs(def), [def]);
  const { getFieldLabel } = useFieldHelpers(formDefs);

  const getFieldDef = (fieldName: string) =>
    formDefs.find((d) => d.field === fieldName);

  const accountDef = getFieldDef("account")?.children;

  return (
    <Card>
      <Card.Header
        code={contact.id ? `#${contact.id}` : undefined}
        statusValue={
          <View className="flex-col gap-1 mt-1">
            <Text className="text-base font-semibold text-slate-800">
              {contact.name || "—"}
            </Text>
            {contact.title && <Tag>{contact.title}</Tag>}
          </View>
        }
      />

      {/* Contact Information Section */}
      <Card.Section className="bg-slate-50/70">
        <Text className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          {i18n.t("basic information")}
        </Text>
        <FieldGrid>
          {["email", "mobile", "phone"].map((fieldName) => (
            <Field
              key={fieldName}
              label={getFieldLabel(fieldName)}
              value={contact[fieldName]}
            />
          ))}
        </FieldGrid>
      </Card.Section>

      {/* Account Section */}
      {contact.account && (
        <Card.Section>
          <Text className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            {getFieldLabel("account")}
          </Text>
          <ItemsTable
            def={accountDef}
            value={[contact.account]}
            height={80}
            excludeFields={["id", "pk"]}
            columnOverrides={{
              roles: {
                cellRenderer: (params: { value: string[] }) =>
                  Array.isArray(params.value) ? (
                    <View className="flex-row items-center h-full gap-1">
                      {params.value.map((role) => (
                        <Tag key={role} color="blue">
                          {role}
                        </Tag>
                      ))}
                    </View>
                  ) : (
                    (params.value ?? "—")
                  ),
              },
            }}
          />
        </Card.Section>
      )}

      {/* Footer: Metadata + Edit */}
      <Card.Footer
        metadata={contact}
        canEdit={!!onEdit}
        onEdit={() => onEdit?.(contact)}
      />
    </Card>
  );
}
