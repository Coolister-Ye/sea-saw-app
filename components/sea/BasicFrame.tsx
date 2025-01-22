import clsx from "clsx";
import View from "../themed/View";
import Text from "../themed/Text";
import Button from "../themed/Button";
import { constants } from "../../constants/Constants";
import { useLocale } from "@/context/Locale";

type BasicFrameProps = {
  headerText: string;
  children: React.ReactNode; // 明确声明 children 类型
  handleCancel: () => void; // onCancel 应该作为 props 传入
  handleSubmit: () => void; // handleSubmit 也应作为 props 传入
  handleReset?: () => void;
};

export function BasicFrame({
  headerText,
  children,
  handleCancel,
  handleSubmit,
  handleReset,
  ...props
}: BasicFrameProps) {
  const commonClassName =
    "bg-neutral-50 px-5 py-3 ring-1 ring-inset ring-neutral-200";
  const { i18n } = useLocale();

  return (
    <View className="w-full h-full">
      {/* Header */}
      <View className={clsx(commonClassName, "mb-2")}>
        <Text className="text-2xl">{headerText}</Text>
      </View>

      {/* Input form */}
      <View className="py-3 flex-1">{children}</View>

      {/* Footer for buttons */}
      <View
        className={clsx("flex flex-row justify-end w-full", commonClassName)}
      >
        {handleReset && (
          <Button
            variant="outlined"
            className="px-3.5 py-2.5 text-sm font-semibold mr-1 rounded-2xl hover:bg-neutral-100"
            onPress={handleReset}
          >
            {i18n.t("reset")}
          </Button>
        )}
        <Button
          variant="outlined"
          className="px-3.5 py-2.5 text-sm font-semibold mr-1 rounded-2xl hover:bg-neutral-100"
          onPress={handleCancel}
        >
          {i18n.t("Cancel")}
        </Button>
        <Button
          variant="success"
          className="px-3.5 py-2.5 text-sm font-semibold rounded-2xl"
          onPress={handleSubmit}
        >
          {i18n.t("Comfirm")}
        </Button>
      </View>
    </View>
  );
}
