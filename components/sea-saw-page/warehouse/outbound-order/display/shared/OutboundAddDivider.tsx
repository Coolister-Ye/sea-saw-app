import React from "react";
import i18n from "@/locale/i18n";
import { View, Pressable } from "react-native";
import { Text } from "@/components/sea-saw-design/text";
import { PlusCircleIcon } from "react-native-heroicons/outline";
interface OutboundAddDividerProps {
  disabled?: boolean;
  onAdd: () => void;
}

export default function OutboundAddDivider({
  disabled,
  onAdd,
}: OutboundAddDividerProps) {
  return (
    <View className="px-4 py-3">
      <View className="flex-row items-center">
        {/* Left line */}
        <View className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 to-slate-200" />

        {/* Center button */}
        <Pressable
          onPress={() => {
            if (!disabled) onAdd();
          }}
          disabled={disabled}
          className="mx-3"
          style={({ pressed }) => ({
            opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
          })}
        >
          <View
            className={`flex-row items-center gap-2 px-4 py-2 rounded-full border ${
              disabled
                ? "border-slate-200 bg-slate-50"
                : "border-indigo-200 bg-indigo-50/50"
            }`}
            style={{
              boxShadow: disabled
                ? "0 1px 4px rgba(100, 116, 139, 0.05)"
                : "0 1px 4px rgba(99, 102, 241, 0.1)",
            }}
          >
            <PlusCircleIcon
              size={16}
              color={disabled ? "#94a3b8" : "#6366f1"}
              strokeWidth={2}
            />
            <Text
              className={`text-xs font-semibold ${
                disabled ? "text-slate-400" : "text-indigo-600"
              }`}
            >
              {i18n.t("Create Outbound Order")}
            </Text>
          </View>
        </Pressable>

        {/* Right line */}
        <View className="flex-1 h-px bg-gradient-to-l from-transparent via-slate-200 to-slate-200" />
      </View>
    </View>
  );
}
