import React from "react";
import i18n from "@/locale/i18n";
import { View } from "react-native";
import { Text } from "@/components/sea-saw-design/text";
import { Button } from "antd";
import { PencilSquareIcon } from "react-native-heroicons/outline";
import DisplayForm from "@/components/sea-saw-design/form/DisplayForm";
import { CardMetadata, CardSection } from "../../base";

interface CompanyCardProps {
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

export default function CompanyCard({ def, data, onEdit }: CompanyCardProps) {
  const company = data ?? {};

  /** Hide metadata fields from DisplayForm */
  const displayConfig: Record<string, any> = {};

  for (const field of METADATA_FIELDS) {
    displayConfig[field] = { hidden: true };
  }

  return (
    <View className="bg-white rounded overflow-hidden shadow-sm pt-1">
      {/* Regular fields via DisplayForm */}
      <DisplayForm
        table="company"
        def={def}
        data={company}
        config={displayConfig}
      />

      {/* Footer: Metadata + Edit */}
      <CardSection className="py-2.5 bg-slate-50/50">
        <View className="flex-row justify-between items-center">
          <CardMetadata
            owner={company.owner}
            created_at={company.created_at}
            updated_at={company.updated_at}
            created_by={company.created_by}
            updated_by={company.updated_by}
          />
          {onEdit && (
            <Button
              type="text"
              size="small"
              className="p-0 h-auto"
              onClick={() => onEdit(company)}
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
