import React from "react";
import { View } from "react-native";
import { Text } from "@/components/sea-saw-design/text";
import DisplayForm from "@/components/sea-saw-design/form/DisplayForm";
import { CardMetadata, CardSection, CardEditButton } from "../../../base";
import RoleBadges from "./RoleBadges";
import ContactItemsTable from "../../contact/display/ContactItemsTable";

interface AccountCardProps {
  def?: any[];
  data?: Record<string, any> | null;
  onEdit?: (data: any) => void;
  columnOrder?: string[];
}

/** Metadata fields rendered separately via CardMetadata */
const METADATA_FIELDS = [
  "owner",
  "created_at",
  "updated_at",
  "created_by",
  "updated_by",
  "roles",
];

export default function AccountCard({
  def,
  data,
  onEdit,
  columnOrder,
}: AccountCardProps) {
  const account = data ?? {};

  /** Configure DisplayForm with custom renderers */
  const displayConfig: Record<string, any> = {};

  // Hide metadata fields
  for (const field of METADATA_FIELDS) {
    displayConfig[field] = { hidden: true };
  }

  // Custom renderer for contacts field
  displayConfig["contacts"] = {
    fullWidth: true,
    render: (f: any, v: any[]) => {
      return <ContactItemsTable value={v} def={f} />;
    },
  };

  // Custom renderer for contact_ids field
  displayConfig["contact_ids"] = {
    hidden: true,
  };

  return (
    <View className="bg-white rounded overflow-hidden shadow-sm pt-1">
      {/* Regular fields via DisplayForm */}
      <DisplayForm
        table="account"
        def={def}
        data={account}
        config={displayConfig}
        columnOrder={columnOrder}
      />

      {/* Role badges - shown at top if roles exist */}
      {account.roles && account.roles.length > 0 && (
        <CardSection className="border-none py-2 items-end">
          <RoleBadges roles={account.roles} />
        </CardSection>
      )}

      {/* Footer: Metadata + Edit */}
      <CardSection className="py-2.5 bg-slate-50/50">
        <View className="flex-row justify-between items-center">
          <CardMetadata
            owner={account.owner}
            created_at={account.created_at}
            updated_at={account.updated_at}
            created_by={account.created_by}
            updated_by={account.updated_by}
          />
          {onEdit && <CardEditButton onClick={() => onEdit(account)} />}
        </View>
      </CardSection>
    </View>
  );
}
