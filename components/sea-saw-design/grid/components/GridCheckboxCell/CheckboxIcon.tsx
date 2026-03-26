import React, { memo } from "react";
import { Pressable, View } from "react-native";
import { styles } from "./styles";

type CheckboxIconProps = {
  checked: boolean;
  indeterminate?: boolean;
  onPress: () => void;
  hitSlop?: number;
};

export const CheckboxIcon = memo(function CheckboxIcon({
  checked,
  indeterminate = false,
  onPress,
  hitSlop = 8,
}: CheckboxIconProps) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={hitSlop}
      style={({ pressed }) => [
        styles.box,
        checked && styles.boxChecked,
        indeterminate && styles.boxIndeterminate,
        pressed && styles.boxPressed,
      ]}
    >
      {indeterminate ? (
        <View style={styles.indeterminateLine} />
      ) : checked ? (
        <View style={styles.checkmark} />
      ) : null}
    </Pressable>
  );
});
