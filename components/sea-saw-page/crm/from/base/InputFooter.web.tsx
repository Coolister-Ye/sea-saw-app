import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useLocale } from "@/context/Locale";
import clsx from "clsx";
import { View } from "react-native";

type InputFooterProps = {
  onSave: () => void;
  onCancel: () => void;
  loading?: boolean;
  className?: string;
};

function InputFooter({
  onSave,
  onCancel,
  loading,
  className,
}: InputFooterProps) {
  const { i18n } = useLocale();
  return (
    <View
      className={clsx(
        "flex flex-row justify-end gap-1 p-1 bg-white",
        className
      )}
    >
      <Button className="w-fit h-fit py-1" onPress={onSave} disabled={loading}>
        <Text className="text-white">{i18n.t("Save")}</Text>
      </Button>
      <Button
        variant="outline"
        className="w-fit h-fit py-1 bg-white"
        onPress={onCancel}
      >
        <Text>{i18n.t("Cancel")}</Text>
      </Button>
    </View>
  );
}

export default InputFooter;
export type { InputFooterProps };
export { InputFooter };
