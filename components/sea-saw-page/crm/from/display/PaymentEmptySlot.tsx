import { useState } from "react";
import { View } from "react-native";
import { Button, Typography, message } from "antd";
import { PlusCircleFilled } from "@ant-design/icons";
import { Text } from "@/components/ui/text";
import EmptySlot from "../base/EmptySlot";
import { useLocale } from "@/context/Locale";
import useDataService from "@/hooks/useDataService";

type Props = {
  orderId: string | number;
  onCreate?: (response: any) => void;
  disabled?: boolean;
};

const MAX_WIDTH = 360;

export default function PaymentEmptySlot({
  orderId,
  onCreate,
  disabled = false,
}: Props) {
  const { i18n } = useLocale();
  const { create } = useDataService();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);

  return (
    <>
      {contextHolder}

      <EmptySlot>
        <View className="flex-col items-center justify-center">
          {disabled ? (
            <Text className="text-gray-400 text-sm text-center">
              {i18n.t("No Payments")}
            </Text>
          ) : (
            <Button
              type="link"
              icon={<PlusCircleFilled />}
              loading={loading}
              onClick={onCreate}
            >
              {i18n.t("Create Payment")}
            </Button>
          )}
        </View>
      </EmptySlot>
    </>
  );
}
