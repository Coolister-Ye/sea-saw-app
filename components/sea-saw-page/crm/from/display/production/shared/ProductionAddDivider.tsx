import React from "react";
import i18n from '@/locale/i18n';
import { View, Pressable } from "react-native";
import { Text } from "@/components/ui/text";
import { PlusCircleIcon } from "react-native-heroicons/outline";
interface ProductionAddDividerProps {
  disabled?: boolean;
  onAdd: () => void;
}

export default function ProductionAddDivider({
  disabled,
  onAdd,
}: ProductionAddDividerProps) {
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
                : "border-amber-200 bg-amber-50/50"
            }`}
            style={{
              shadowColor: disabled ? "#64748b" : "#f59e0b",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: disabled ? 0.05 : 0.1,
              shadowRadius: 4,
            }}
          >
            <PlusCircleIcon
              size={16}
              color={disabled ? "#94a3b8" : "#f59e0b"}
              strokeWidth={2}
            />
            <Text
              className={`text-xs font-semibold ${
                disabled ? "text-slate-400" : "text-amber-600"
              }`}
            >
              {i18n.t("Create Production Order")}
            </Text>
          </View>
        </Pressable>

        {/* Right line */}
        <View className="flex-1 h-px bg-gradient-to-l from-transparent via-slate-200 to-slate-200" />
      </View>
    </View>
  );
}
