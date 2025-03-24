import { XCircleIcon } from "react-native-heroicons/outline";
import { Pressable } from "react-native";

type CloseIconProps = {
  onPress: () => void;
  className: string;
};

export default function CloseIcon({
  onPress,
  className,
  ...props
}: CloseIconProps) {
  return (
    <Pressable onPress={onPress} className={className} {...props}>
      <XCircleIcon size={24} className="text-zinc-600 hover:opacity-80" />
    </Pressable>
  );
}
