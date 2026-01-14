import { useState } from "react";
import { View } from "react-native";
import { Button, Typography, message } from "antd";
import { PlusCircleFilled } from "@ant-design/icons";
import { Text } from "@/components/ui/text";
import EmptySlot from "../../base/EmptySlot";
import { useLocale } from "@/context/Locale";
import useDataService from "@/hooks/useDataService";

type Props = {
  orderId: string | number;
  onCreate?: (response: any) => void;
  disabled?: boolean;
};

const MAX_WIDTH = 360;

export default function PurchaseOrderEmptySlot({
  orderId,
  onCreate,
  disabled = false,
}: Props) {
  const { i18n } = useLocale();
  const { request } = useDataService();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (disabled) return;

    setLoading(true);
    try {
      const response = await request({
        uri: "createPurchaseOrder",
        method: "POST",
        id: orderId,
      });

      messageApi.success(i18n.t("Purchase order created"));
      onCreate?.(response);
    } catch (e: any) {
      // 统一处理错误信息
      const msg =
        e?.detail || e?.message || i18n.t("Failed to create purchase order");
      messageApi.error(
        <Typography.Text
          style={{ maxWidth: MAX_WIDTH }}
          ellipsis={{ tooltip: msg }}
        >
          {msg}
        </Typography.Text>
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}

      <EmptySlot>
        <View className="flex-col items-center justify-center">
          {disabled ? (
            <Text className="text-gray-400 text-sm text-center">
              {i18n.t("No purchase orders")}
            </Text>
          ) : (
            <Button
              type="link"
              icon={<PlusCircleFilled />}
              loading={loading}
              onClick={handleCreate}
            >
              {i18n.t("Create purchase orders")}
            </Button>
          )}
        </View>
      </EmptySlot>
    </>
  );
}
