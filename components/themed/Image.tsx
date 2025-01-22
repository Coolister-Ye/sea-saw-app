import View from "./View";
import { StyleSheet } from "react-native";
import { Image as ExpoImage, ImageProps as ExpoImageProps } from "expo-image";

type ImageProps = ExpoImageProps;
export default function Image({ className, style, ...rest }: ImageProps) {
  return (
    <View className={className}>
      <ExpoImage style={[styles.image, style]} {...rest} />
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    flex: 1,
    width: "100%",
  },
});
