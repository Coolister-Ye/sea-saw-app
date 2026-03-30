import React from "react";
import { View } from "react-native";
import i18n from "@/locale/i18n";
import { Text } from "@/components/sea-saw-design/text";
import { ItemsTable } from "@/components/sea-saw-page/base";
import Tag from "@/components/sea-saw-design/tag";
import { DisplayCard } from "@/components/sea-saw-design/display-card";

interface ContactCardProps {
  def?: any[];
  data?: Record<string, any> | null;
  onEdit?: (data: any) => void;
}

export default function ContactCard({ def, data, onEdit }: ContactCardProps) {
  return (
    <DisplayCard
      def={def}
      value={data}
      canEdit={!!onEdit}
      onItemClick={data && onEdit ? () => onEdit(data) : undefined}
      header={{
        codeField: "id",
        statusField: "name",
        statusRender: (_fieldDef, name, item) => (
          <View className="flex-col gap-1 mt-1">
            <Text className="text-base font-semibold text-slate-800">
              {name || "—"}
            </Text>
            {item.title && <Tag>{item.title}</Tag>}
          </View>
        ),
      }}
      sections={[
        {
          title: i18n.t("basic information"),
          fields: ["email", "mobile", "phone"],
          className: "bg-slate-50/70",
        },
        {
          fields: ["account"],
          hidden: (item) => !item.account,
        },
      ]}
      fieldConfig={{
        id: { label: (v) => (v ? `#${v}` : "—") },
        account: {
          fullWidth: true,
          render: (_v, item, fieldDef) =>
            item.account ? (
              <ItemsTable
                def={(fieldDef as any)?.children}
                value={[item.account]}
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
            ) : undefined,
        },
      }}
    />
  );
}
