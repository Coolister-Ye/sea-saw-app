import { View, Pressable } from "react-native";
import i18n from "@/locale/i18n";
import { Text } from "@/components/sea-saw-design/text";
import { BanknotesIcon, PlusIcon } from "react-native-heroicons/outline";

type Props = {
  onCreate?: () => void;
  disabled?: boolean;
};

export default function PaymentEmptySlot({
  onCreate,
  disabled = false,
}: Props) {
  return (
    <View className="m-3">
      <View
        className="py-10 px-6 border-2 border-dashed border-slate-200 rounded-2xl bg-gradient-to-br from-slate-50/50 to-white"
        style={{
          boxShadow: "0 2px 8px rgba(100, 116, 139, 0.03)",
        }}
      >
        <View className="items-center">
          {/* Icon container */}
          <View
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 items-center justify-center mb-4 border border-slate-200/50"
            style={{
              boxShadow: "0 2px 4px rgba(15, 23, 42, 0.04)",
            }}
          >
            <BanknotesIcon size={28} color="#94a3b8" />
          </View>

          {/* Text */}
          <Text className="text-base font-medium text-slate-400 mb-1">
            {i18n.t("No Payments")}
          </Text>
          <Text className="text-sm text-slate-300 text-center mb-5">
            {disabled
              ? i18n.t("Payments cannot be added to this order")
              : i18n.t("Add your first payment record")}
          </Text>

          {/* Action Button */}
          {!disabled && (
            <Pressable
              onPress={onCreate}
              className="flex-row items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 active:opacity-80"
              style={({ pressed }) => ({
                opacity: pressed ? 0.85 : 1,
                boxShadow: "0 4px 8px rgba(16, 185, 129, 0.25)",
              })}
            >
              <PlusIcon size={16} color="#ffffff" strokeWidth={2.5} />
              <Text className="text-sm font-semibold text-white">
                {i18n.t("Create Payment")}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}
