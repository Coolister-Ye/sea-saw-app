import React, { memo } from "react";
import { View } from "react-native";

import { Text } from "@/components/sea-saw-design/text";
import { cn } from "@/lib/utils";

const AVATAR_COLORS = [
  "bg-gradient-to-br from-blue-400 to-blue-600",
  "bg-gradient-to-br from-purple-400 to-purple-600",
  "bg-gradient-to-br from-pink-400 to-pink-600",
  "bg-gradient-to-br from-emerald-400 to-emerald-600",
  "bg-gradient-to-br from-teal-400 to-teal-600",
  "bg-gradient-to-br from-cyan-400 to-cyan-600",
  "bg-gradient-to-br from-amber-400 to-amber-600",
  "bg-gradient-to-br from-rose-400 to-rose-600",
] as const;

export const getAvatarColor = (name: string): string =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

export const getInitials = (name: string): string =>
  name?.slice(0, 1).toUpperCase() || "?";

interface AvatarProps {
  name: string;
  size?: "small" | "large";
}

const ContactAvatar = memo(({ name, size = "large" }: AvatarProps) => {
  const isSmall = size === "small";

  return (
    <View
      className={cn(
        "rounded-full items-center justify-center shadow-sm",
        isSmall ? "w-5 h-5" : "w-9 h-9",
        getAvatarColor(name)
      )}
    >
      <Text
        className={cn(
          "text-white font-semibold",
          isSmall ? "text-[10px]" : "text-sm"
        )}
      >
        {getInitials(name)}
      </Text>
    </View>
  );
});
ContactAvatar.displayName = "ContactAvatar";

export default ContactAvatar;
