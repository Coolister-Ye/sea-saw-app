import React from "react";
import i18n from "@/locale/i18n";
import { Text } from "@/components/sea-saw-design/text";
import { ItemsTable } from "@/components/sea-saw-page/base";
import RoleBadges from "./RoleBadges";
import { DisplayCard } from "@/components/sea-saw-design/display-card";

interface AccountCardProps {
  def?: any[];
  data?: Record<string, any> | null;
  onEdit?: (data: any) => void;
}

export default function AccountCard({ def, data, onEdit }: AccountCardProps) {
  return (
    <DisplayCard
      def={def}
      value={data}
      canEdit={!!onEdit}
      onItemClick={data && onEdit ? () => onEdit(data) : undefined}
      header={{
        codeField: "id",
        statusField: "account_name",
        statusRender: (_fieldDef, name) => (
          <Text className="text-base font-semibold text-slate-800 mt-1">
            {name || "???"}
          </Text>
        ),
        rightContent: (item) =>
          item.roles?.length > 0 ? (
            <RoleBadges roles={item.roles} />
          ) : undefined,
      }}
      sections={[
        {
          title: i18n.t("basic information"),
          fields: ["phone", "mobile", "email", "address"],
          className: "bg-slate-50/70",
        },
        {
          title: i18n.t("business information"),
          fields: ["industry", "website", "description"],
        },
        {
          fields: ["contacts"],
          hidden: (item) => !item.contacts?.length,
        },
        {
          fields: ["bank_accounts"],
          hidden: (item) => !item.bank_accounts?.length,
        },
      ]}
      fieldConfig={{
        id: { label: (v) => (v ? `#${v}` : "—") },
        contacts: {
          fullWidth: true,
          render: (_v, item, fieldDef) =>
            item.contacts?.length > 0 ? (
              <ItemsTable
                def={(fieldDef as any)?.child?.children}
                value={item.contacts}
                excludeFields={["id", "pk", "account"]}
              />
            ) : undefined,
        },
        bank_accounts: {
          fullWidth: true,
          render: (_v, item, fieldDef) =>
            item.bank_accounts?.length > 0 ? (
              <ItemsTable
                def={(fieldDef as any)?.child?.children}
                value={item.bank_accounts}
                excludeFields={["id", "pk", "account_holder"]}
              />
            ) : undefined,
        },
      }}
    />
  );
}
