import React from "react";
import { View } from "react-native";
import { UserIcon } from "react-native-heroicons/outline";
import { FormDef } from "@/hooks/useFormDefs";
import { Text } from "@/components/sea-saw-design/text";
import { Popover } from "antd";
import clsx from "clsx";

interface Contact {
  key?: string | number;
  full_name: string;
  email?: string;
  [key: string]: any; // 允许扩展字段
}

interface ContactDisplayProps {
  def?: FormDef;
  value?: Contact | null;
  className?: string;
  parentNode?: HTMLElement;
}

export default function ContactDisplay({
  def,
  value,
  className,
  parentNode,
}: ContactDisplayProps) {
  const key2name = Object.fromEntries(
    Object.entries(def?.children || {}).map(([k, v]) => [k, v.label]),
  );

  const renderCompany = (v: any) => {
    if (v === null || v === undefined || v === "null") return "-";
    return <Text>{v.company_name ?? "-"}</Text>;
  };

  // 无联系人信息时
  if (!value) {
    return <Text>-</Text>;
  }

  // 联系人详情
  const contactDetails = (
    <View className="space-y-3 p-2 w-[220px]">
      {/* 顶部：头像 + 姓名 */}
      <View className="flex flex-row items-center gap-2">
        <UserIcon size={18} className="text-gray-500" />
        <Text className="text-base font-semibold text-gray-800">
          {value.name}
        </Text>
      </View>

      {/* 分隔线 */}
      <View className="h-[1px] bg-gray-200 my-1" />

      {/* 详细信息：key-value 对齐 */}
      <View className="flex flex-col space-y-1">
        {Object.entries(value)
          .filter(([k]) => k !== "full_name" && value[k] !== undefined)
          .map(([k, v]) => (
            <View
              key={k}
              className="flex flex-row items-center rounded px-1 py-0.5"
            >
              {/* key 列 */}
              <View className="w-[70px] items-end pr-2">
                <Text className="text-gray-500 text-xs capitalize">
                  {key2name[k]}
                </Text>
              </View>

              {/* value 列 */}
              {k === "company" ? (
                renderCompany(v)
              ) : (
                <View className="flex-1">
                  <Text
                    className="text-gray-800 text-sm font-medium"
                    numberOfLines={1}
                  >
                    {v === null || String(v) === "" ? "-" : String(v)}
                  </Text>
                </View>
              )}
            </View>
          ))}
      </View>
    </View>
  );

  // 主显示：Popover 触发区
  return (
    <Popover
      content={contactDetails}
      title={false}
      trigger="hover"
      getPopupContainer={(trigger) => {
        return parentNode ?? trigger;
      }}
    >
      <Text
        className={clsx(
          "text-blue-600 underline underline-offset-2 cursor-pointer hover:text-blue-800 index-99",
          className,
        )}
      >
        {value.name}
      </Text>
    </Popover>
  );
}
