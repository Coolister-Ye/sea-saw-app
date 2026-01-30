import React from "react";
import i18n from "@/locale/i18n";
import { View } from "react-native";
import { Text } from "@/components/sea-saw-design/text";
import { Button } from "antd";
import { PencilSquareIcon } from "react-native-heroicons/outline";
import DisplayForm from "@/components/sea-saw-design/form/DisplayForm";
import { CardMetadata, CardSection } from "../../base";
import { CompanyPopover } from "../company";

interface ContactCardProps {
  def?: any[];
  data?: Record<string, any> | null;
  onEdit?: (data: any) => void;
}

/** Metadata fields rendered separately via CardMetadata */
const METADATA_FIELDS = [
  "owner",
  "created_at",
  "updated_at",
  "created_by",
  "updated_by",
];

export default function ContactCard({ def, data, onEdit }: ContactCardProps) {
  const contact = data ?? {};

  /** Hide metadata fields from DisplayForm, custom render for company */
  const displayConfig: Record<string, any> = {
    company: {
      render: (_def: any, value: any) => <CompanyPopover value={value} />,
    },
    company_id: { hidden: true },
  };

  // Hide metadata fields from DisplayForm
  for (const field of METADATA_FIELDS) {
    displayConfig[field] = { hidden: true };
  }

  return (
    <View className="bg-white rounded overflow-hidden shadow-sm pt-1">
      {/* Regular fields via DisplayForm */}
      <DisplayForm
        table="contact"
        def={def}
        data={contact}
        config={displayConfig}
      />

      {/* Footer: Metadata + Edit */}
      <CardSection className="py-2.5 bg-slate-50/50">
        <View className="flex-row justify-between items-center">
          <CardMetadata
            owner={contact.owner}
            created_at={contact.created_at}
            updated_at={contact.updated_at}
            created_by={contact.created_by}
            updated_by={contact.updated_by}
          />
          {onEdit && (
            <Button
              type="text"
              size="small"
              className="p-0 h-auto"
              onClick={() => onEdit(contact)}
            >
              <View className="flex-row items-center gap-1">
                <PencilSquareIcon size={14} color="#64748b" />
                <Text className="text-xs text-slate-500 font-medium">
                  {i18n.t("Edit")}
                </Text>
              </View>
            </Button>
          )}
        </View>
      </CardSection>
    </View>
  );
}
