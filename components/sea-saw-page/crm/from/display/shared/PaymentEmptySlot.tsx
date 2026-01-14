import { View } from "react-native";
import { Button } from "antd";
import { PlusCircleFilled } from "@ant-design/icons";
import { Text } from "@/components/ui/text";
import EmptySlot from "../../base/EmptySlot";
import { useLocale } from "@/context/Locale";

type Props = {
  onCreate?: () => void;
  disabled?: boolean;
};

export default function PaymentEmptySlot({
  onCreate,
  disabled = false,
}: Props) {
  const { i18n } = useLocale();

  return (
    <EmptySlot>
      <View className="flex-col items-center justify-center">
        {disabled ? (
          <Text className="text-gray-400 text-sm text-center">
            {i18n.t("No Payments")}
          </Text>
        ) : (
          <Button type="link" icon={<PlusCircleFilled />} onClick={onCreate}>
            {i18n.t("Create Payment")}
          </Button>
        )}
      </View>
    </EmptySlot>
  );
}
