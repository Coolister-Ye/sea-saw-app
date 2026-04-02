import React from "react";
import i18n from "@/locale/i18n";
import { Text } from "@/components/sea-saw-design/text";
import Tag from "@/components/sea-saw-design/tag";
import { DisplayCard } from "@/components/sea-saw-design/display-card";

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
  return (
    <DisplayCard
      def={def}
      value={data}
      canEdit={!!onEdit}
      onItemClick={data && onEdit ? () => onEdit(data) : undefined}
      header={{
        codeField: "id",
        statusField: "bank_name",
        statusRender: (_fieldDef, name) => (
          <Text className="text-base font-semibold text-slate-800">
            {name || "—"}
          </Text>
        ),
      }}
      sections={[
        {
          title: i18n.t("basic information"),
          fields: ["account_number", "currency"],
          className: "bg-slate-50/70",
        },
        {
          title: i18n.t("bank details"),
          fields: ["swift_code", "branch", "bank_address", "is_primary"],
        },
        {
          fields: ["remark"],
          hidden: (item) => !item.remark,
        },
      ]}
      fieldConfig={{
        id: { label: (v) => (v ? `#${v}` : "—") },
        is_primary: {
          render: (value) =>
            value ? (
              <Tag color="green">{i18n.t("Primary")}</Tag>
            ) : undefined,
        },
        remark: { fullWidth: true },
      }}
    />
  );
}
