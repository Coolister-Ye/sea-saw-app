import React, { useMemo } from "react";
import { View } from "react-native";
import { BuildingOfficeIcon } from "react-native-heroicons/outline";
import { Popover, Button } from "antd";

import { FormDef } from "@/hooks/useFormDefs";
import { Text } from "@/components/sea-saw-design/text";
import { InfoRow } from "@/components/sea-saw-page/crm/from/base/InfoRow";

interface Company {
  id?: string | number;
  pk?: string | number;
  company_name: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface CompanyPopoverProps {
  def?: FormDef;
  value?: Company | null;
}

export default function CompanyPopover({ value }: CompanyPopoverProps) {
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
              <BuildingOfficeIcon size={16} className="text-blue-600" />
            </View>

            <View className="flex-1">
              <Text className="text-sm font-semibold text-gray-900">
                {value.company_name}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View className="h-[1px] bg-gray-100" />

          {/* Info */}
          <View className="space-y-1.5">
            <Text>
              {value.address && <InfoRow icon="📍" text={value.address} />}
              {value.phone && <InfoRow icon="☎️" text={value.phone} />}
              {value.email && <InfoRow icon="📧" text={value.email} />}
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
        {value.company_name}
      </Button>
    </Popover>
  );
}
