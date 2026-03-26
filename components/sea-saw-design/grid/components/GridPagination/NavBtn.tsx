import React from "react";
import { TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles, C } from "./styles";

type NavBtnProps = {
  icon: "play-skip-back" | "chevron-back" | "chevron-forward" | "play-skip-forward";
  onPress(): void;
  disabled: boolean;
};

export function NavBtn({ icon, onPress, disabled }: NavBtnProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.5}
      style={[styles.navBtn, disabled && { opacity: 0.5 }]}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Ionicons name={icon} size={15} color={disabled ? C.disabled : C.secondary} />
    </TouchableOpacity>
  );
}
