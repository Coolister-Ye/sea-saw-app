import React from "react";
import { Pressable, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles, textStyles } from "./styles";

export type MenuItemProps = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  active?: boolean;
  disabled?: boolean;
  onPress(): void;
};

export function MenuItem({ icon, label, active = false, disabled = false, onPress }: MenuItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.item,
        pressed && !disabled && styles.itemPressed,
        disabled && styles.itemDisabled,
      ]}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
    >
      <Ionicons
        name={icon}
        size={15}
        color={disabled ? "#d1d5db" : active ? "#3b82f6" : "#374151"}
        style={styles.itemIcon}
      />
      <Text style={[textStyles.itemLabel, active && textStyles.itemLabelActive, disabled && textStyles.itemLabelDisabled]}>
        {label}
      </Text>
      {active && <View style={styles.activeDot} />}
    </Pressable>
  );
}
