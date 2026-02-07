import { useState } from "react";
import i18n from "@/locale/i18n";
import { View, Pressable } from "react-native";
import { Typography, message } from "antd";
import { Text } from "@/components/sea-saw-design/text";
import useDataService from "@/hooks/useDataService";
import {
  WrenchScrewdriverIcon,
  PlusIcon,
} from "react-native-heroicons/outline";

type Props = {
  pipelineId: string | number;
  onCreate?: (response: any) => void;
  disabled?: boolean;
};

const MAX_WIDTH = 360;

export default function ProductionOrderEmptySlot({
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
        uri: "createProductionOrder",
        method: "POST",
        id: pipelineId,
        body: {
          auto_update_status: true,
        },
      });

      messageApi.success(i18n.t("Production order created"));
      onCreate?.(response);
    } catch (e: any) {
      // 统一处理错误信息
      const msg =
        e?.detail || e?.message || i18n.t("Failed to create production order");
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
            boxShadow: "0 2px 8px rgba(100, 116, 139, 0.03)",
          }}
        >
          <View className="items-center">
            {/* Icon container */}
            <View
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 items-center justify-center mb-4 border border-amber-200/50"
              style={{
                boxShadow: "0 2px 4px rgba(245, 158, 11, 0.08)",
              }}
            >
              <WrenchScrewdriverIcon size={28} color="#fbbf24" />
            </View>

            {/* Text */}
            <Text className="text-base font-medium text-slate-400 mb-1">
              {i18n.t("No Production Orders")}
            </Text>
            <Text className="text-sm text-slate-300 text-center mb-5">
              {disabled
                ? i18n.t("Production orders cannot be added to this order")
                : i18n.t("Add your first production order")}
            </Text>

            {/* Action Button */}
            {!disabled && (
              <Pressable
                onPress={handleCreate}
                disabled={loading}
                className="flex-row items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 active:opacity-80"
                style={({ pressed }) => ({
                  opacity: loading ? 0.6 : pressed ? 0.85 : 1,
                  boxShadow: "0 4px 8px rgba(245, 158, 11, 0.25)",
                })}
              >
                <PlusIcon size={16} color="#ffffff" strokeWidth={2.5} />
                <Text className="text-sm font-semibold text-white">
                  {loading
                    ? i18n.t("Creating...")
                    : i18n.t("Create Production Order")}
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </>
  );
}
