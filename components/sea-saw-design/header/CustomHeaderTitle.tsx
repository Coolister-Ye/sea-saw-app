import { HeaderTitleProps as BaseHeaderTitleProps } from "@react-navigation/elements";
import { Pressable, Text, Image } from "react-native";

type HeaderTitleProps = {
  onPress?: () => void;
} & BaseHeaderTitleProps;

function HeaderTitle({
  allowFontScaling,
  tintColor,
  style,
  children,
  onPress,
}: HeaderTitleProps) {
  return (
    <Pressable
      className="flex flex-row items-center hover:opacity-75 px-1"
      onPress={onPress}
    >
      <Image
        style={{ height: 35, width: 35 }}
        source={require("@/assets/images/sea-saw-logo.png")}
        resizeMode="contain"
      />
      <Text
        allowFontScaling={allowFontScaling}
        className="text-lg font-extrabold text-sky-900"
        style={[{ color: tintColor }]}
      >
        {children}
      </Text>
    </Pressable>
  );
}

export { HeaderTitle };
