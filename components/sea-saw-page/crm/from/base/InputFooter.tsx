import { Button } from "@/components/sea-saw-design/button";
import i18n from "@/locale/i18n";
import { Text } from "@/components/sea-saw-design/text";
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
  return (
    <View
      className={clsx(
        "flex flex-row justify-end gap-1 p-5 border-t border-gray-200 bg-white",
        className,
      )}
    >
      <Button className="w-fit h-fit py-1" onPress={onSave} disabled={loading}>
        <Text className="text-white">{i18n.t("Save")}</Text>
      </Button>
      <Button
        type="primary"
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
