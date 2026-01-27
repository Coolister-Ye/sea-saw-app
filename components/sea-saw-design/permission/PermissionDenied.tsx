import React from "react";
import i18n from "@/locale/i18n";
import { View } from "@/components/sea-saw-design/view";
import { Text } from "@/components/sea-saw-design/text";
import { ShieldExclamationIcon } from "react-native-heroicons/outline";

interface PermissionDeniedProps {
  /** Custom message to display */
  message?: string;
  /** Show as inline (minimal) or full page */
  variant?: "inline" | "page";
}

/**
 * PermissionDenied Component
 *
 * Displays a friendly message when user doesn't have permission
 *
 * @example
 * <PermissionDenied />
 *
 * @example
 * <PermissionDenied
 *   message="You need admin privileges to access this feature"
 *   variant="page"
 * />
 */
export function PermissionDenied({
  message,
  variant = "inline",
}: PermissionDeniedProps) {
  const defaultMessage = i18n.t(
    "You don't have permission to access this resource",
  );

  if (variant === "inline") {
    return (
      <View className="flex flex-row items-center p-3 bg-yellow-50 border border-yellow-200 rounded-md">
        <ShieldExclamationIcon size={20} className="text-yellow-600 mr-2" />
        <Text variant="secondary" className="text-sm text-yellow-800">
          {message || defaultMessage}
        </Text>
      </View>
    );
  }

  // Page variant - full screen centered
  return (
    <View className="flex-1 justify-center items-center p-6" variant="paper">
      <View className="flex items-center max-w-md">
        <View className="mb-4 p-4 bg-yellow-100 rounded-full">
          <ShieldExclamationIcon size={48} className="text-yellow-600" />
        </View>
        <Text className="text-2xl font-bold mb-2 text-center">
          {i18n.t("Access Denied")}
        </Text>
        <Text variant="secondary" className="text-center mb-6">
          {message || defaultMessage}
        </Text>
        <Text variant="secondary" className="text-sm text-center">
          {i18n.t(
            "If you believe this is an error, please contact your administrator.",
          )}
        </Text>
      </View>
    </View>
  );
}
