import { useState } from "react";
import i18n from "@/locale/i18n";
import { View, Pressable } from "react-native";
import { Typography, message } from "antd";
import { Text } from "@/components/sea-saw-design/text";
import useDataService from "@/hooks/useDataService";
import { TruckIcon, PlusIcon } from "react-native-heroicons/outline";

type Props = {
  pipelineId: string | number;
  onCreate?: (response: any) => void;
  disabled?: boolean;
};

const MAX_WIDTH = 360;

export default function OutboundOrderEmptySlot({
  pipelineId,
  onCreate,
  disabled = false,
}: Props) {
  const { request } = useDataService();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (disabled) return;

    setLoading(true);
    try {
      const response = await request({
        uri: "createOutboundOrder",
        method: "POST",
        id: pipelineId,
        body: {
          auto_update_status: true,
        },
      });

      messageApi.success(i18n.t("Outbound order created"));
      onCreate?.(response);
    } catch (e: any) {
      // 统一处理错误信息
      const msg =
        e?.detail || e?.message || i18n.t("Failed to create outbound order");
      messageApi.error(
        <Typography.Text
          style={{ maxWidth: MAX_WIDTH }}
          ellipsis={{ tooltip: msg }}
        >
          {msg}
        </Typography.Text>,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}

      <View className="m-3">
        <View
          className="py-10 px-6 border-2 border-dashed border-slate-200 rounded-2xl bg-gradient-to-br from-slate-50/50 to-white"
          style={{
            shadowColor: "#64748b",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.03,
            shadowRadius: 8,
          }}
        >
          <View className="items-center">
            {/* Icon container */}
            <View
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-50 items-center justify-center mb-4 border border-indigo-200/50"
              style={{
                shadowColor: "#6366f1",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
              }}
            >
              <TruckIcon size={28} color="#818cf8" />
            </View>

            {/* Text */}
            <Text className="text-base font-medium text-slate-400 mb-1">
              {i18n.t("No Outbound Orders")}
            </Text>
            <Text className="text-sm text-slate-300 text-center mb-5">
              {disabled
                ? i18n.t("Outbound orders cannot be added to this order")
                : i18n.t("Add your first outbound order")}
            </Text>

            {/* Action Button */}
            {!disabled && (
              <Pressable
                onPress={handleCreate}
                disabled={loading}
                className="flex-row items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 active:opacity-80"
                style={({ pressed }) => ({
                  opacity: loading ? 0.6 : pressed ? 0.85 : 1,
                  shadowColor: "#6366f1",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                })}
              >
                <PlusIcon size={16} color="#ffffff" strokeWidth={2.5} />
                <Text className="text-sm font-semibold text-white">
                  {loading
                    ? i18n.t("Creating...")
                    : i18n.t("Create Outbound Order")}
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </>
  );
}
