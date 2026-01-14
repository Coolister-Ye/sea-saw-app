import React from "react";
import { View, Pressable, ViewProps, PressableProps } from "react-native";

interface ItemCardProps {
  children: React.ReactNode;
  clickable?: boolean;
  onPress?: () => void;
  className?: string;
}

/**
 * ItemCard Component
 * A reusable card wrapper that can be either pressable or static
 * @param children - The card content
 * @param clickable - Whether the card should be clickable
 * @param onPress - Optional press handler (only used when clickable is true)
 * @param className - Additional CSS classes to apply
 */
function ItemCard({ children, clickable, onPress, className = "" }: ItemCardProps) {
  const baseClassName = "bg-gray-50 p-4 rounded-lg";
  const hoverClassName = clickable
    ? "hover:bg-gray-100 active:bg-gray-200 cursor-pointer"
    : "";
  const combinedClassName = [baseClassName, hoverClassName, className]
    .filter(Boolean)
    .join(" ");

  if (clickable && onPress) {
    return (
      <Pressable onPress={onPress} className={combinedClassName}>
        {children}
      </Pressable>
    );
  }

  return <View className={combinedClassName}>{children}</View>;
}

export default ItemCard;
export { ItemCard };
