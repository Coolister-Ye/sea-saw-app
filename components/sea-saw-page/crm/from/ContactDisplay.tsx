import React from "react";
import { View, Text } from "react-native";
import { UserIcon } from "react-native-heroicons/outline";
import { EnvelopeIcon } from "@heroicons/react/20/solid";
import { useLocale } from "@/context/Locale";
import { FormDef } from "@/hooks/useFormDefs";

interface Contact {
  key?: string | number;
  full_name: string;
  email?: string;
}

interface ContactDisplayProps {
  def?: FormDef;
  value?: Contact | null;
  className?: string;
}

export default function ContactDisplay({
  value,
  className,
}: ContactDisplayProps) {
  const { i18n } = useLocale();

  if (!value) {
    return (
      <View className="p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
        <Text className="text-gray-400">
          {i18n.t("No contact information")}
        </Text>
      </View>
    );
  }

  return (
    <View
      className={`flex-row items-center p-4 bg-white rounded-2xl shadow-sm border border-gray-100 ${className}`}
    >
      {/* 头像 */}
      <View className="w-12 h-12 bg-gray-200 rounded-full items-center justify-center mr-3 overflow-hidden">
        <UserIcon color="gray" className="w-6 h-6" />
      </View>

      {/* 联系人信息 */}
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-800">
          {value.full_name}
        </Text>
        {value.email ? (
          <View className="flex-row items-center mt-1">
            <EnvelopeIcon className="w-4 h-4 text-gray-400 mr-1" />
            <Text className="text-gray-500 text-sm">{value.email}</Text>
          </View>
        ) : (
          <Text className="text-gray-400 text-sm">{i18n.t("No email")}</Text>
        )}
      </View>
    </View>
  );
}
