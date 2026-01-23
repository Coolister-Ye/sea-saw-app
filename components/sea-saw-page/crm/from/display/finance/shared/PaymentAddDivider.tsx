import React from "react";
import i18n from '@/locale/i18n';
import { View, Pressable } from "react-native";
import { Text } from "@/components/ui/text";
import { PlusCircleIcon } from "react-native-heroicons/outline";
interface PaymentAddDividerProps {
  disabled?: boolean;
  onAdd: () => void;
}

export default function PaymentAddDivider({
  disabled,
  onAdd,
}: PaymentAddDividerProps) {
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
                : "border-emerald-200 bg-emerald-50/50"
            }`}
            style={{
              shadowColor: disabled ? "#64748b" : "#10b981",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: disabled ? 0.05 : 0.1,
              shadowRadius: 4,
            }}
          >
            <PlusCircleIcon
              size={16}
              color={disabled ? "#94a3b8" : "#10b981"}
              strokeWidth={2}
            />
            <Text
              className={`text-xs font-semibold ${
                disabled ? "text-slate-400" : "text-emerald-600"
              }`}
            >
              {i18n.t("Create Payment")}
            </Text>
          </View>
        </Pressable>

        {/* Right line */}
        <View className="flex-1 h-px bg-gradient-to-l from-transparent via-slate-200 to-slate-200" />
      </View>
    </View>
  );
}
