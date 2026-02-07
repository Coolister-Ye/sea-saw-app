import React from "react";
import { View } from "react-native";
import DisplayForm from "@/components/sea-saw-design/form/DisplayForm";
import { CardMetadata, CardSection, CardEditButton } from "../../../base";
import AccountPopover from "../../account/display/AccountPopover";

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
  const displayConfig: Record<string, any> = {};

  // Hide metadata fields from DisplayForm
  for (const field of METADATA_FIELDS) {
    displayConfig[field] = { hidden: true };
  }

  displayConfig["account"] = {
    render: (f: any, v: any) => <AccountPopover def={f} value={v} />,
  };

  displayConfig["account_id"] = {
    hidden: true,
  };

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
          {onEdit && <CardEditButton onClick={() => onEdit(contact)} />}
        </View>
      </CardSection>
    </View>
  );
}
