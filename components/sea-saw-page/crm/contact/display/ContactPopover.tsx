import React, { useMemo } from "react";
import { View } from "react-native";
import { UserIcon } from "react-native-heroicons/outline";
import { Popover, Button } from "antd";

import { FormDef } from "@/hooks/useFormDefs";
import { Text } from "@/components/sea-saw-design/text";
import { InfoRow } from "@/components/sea-saw-page/base/InfoRow";

interface Contact {
  id?: string | number;
  name: string;
  title?: string;
  email?: string;
  mobile?: string;
  phone?: string;
  company?: {
    company_name?: string;
  };
}

interface ContactPopoverProps {
  def?: FormDef;
  value?: Contact | null;
}

export default function ContactPopover({ value }: ContactPopoverProps) {
  /* ========================
   * Popover 内容
   * ======================== */
  const content = useMemo(
    () =>
      value ? (
        <View className="p-3 w-[240px] space-y-3">
          {/* Header */}
          <View className="flex flex-row items-center gap-3">
            <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center">
              <UserIcon size={16} className="text-blue-600" />
            </View>

            <View className="flex-1">
              <Text className="text-sm font-semibold text-gray-900">
                {value.name}
              </Text>
              {value.title && (
                <Text className="text-xs text-gray-500">{value.title}</Text>
              )}
            </View>
          </View>

          {/* Divider */}
          <View className="h-[1px] bg-gray-100" />

          {/* Info */}
          <View className="space-y-1.5">
            <Text>
              {value.email && <InfoRow icon="📧" text={value.email} />}
              {value.mobile && <InfoRow icon="📱" text={value.mobile} />}
              {value.phone && <InfoRow icon="☎️" text={value.phone} />}
              {value.company?.company_name && (
                <InfoRow icon="🏢" text={value.company.company_name} />
              )}
            </Text>
          </View>
        </View>
      ) : null,
    [value],
  );

  if (!value) {
    return <Text>-</Text>;
  }

  /* ========================
   * Trigger
   * ======================== */
  return (
    <Popover
      content={content}
      trigger="hover"
      placement="right"
      mouseEnterDelay={0.15}
    >
      <Button
        type="link"
        tabIndex={0}
        style={{
          padding: 0,
          height: "auto",
          lineHeight: "inherit",
        }}
        className="text-blue-600 hover:text-blue-700"
      >
        {value.name}
      </Button>
    </Popover>
  );
}
