import React, { useCallback } from "react";
import { useRouter } from "expo-router";
import { Cog6ToothIcon } from "react-native-heroicons/outline";
import i18n from "@/locale/i18n";
import { View } from "../view";
import { Button } from "../button";

/**
 * Drawer footer component with settings navigation.
 * Displays a settings button that navigates to the password/settings page.
 */
export const DrawerFooter = React.memo(() => {
  const router = useRouter();

  const handlePress = useCallback(() => {
    router.push("/(app)/(setting)/password");
  }, [router]);

  return (
    <View variant="default" padding="md" className="border-t border-border">
      <Button
        type="text"
        size="middle"
        block
        onPress={handlePress}
        icon={<Cog6ToothIcon className="size-5" />}
        iconPosition="start"
        className="justify-start"
        textClassName="text-sm font-medium"
      >
        {i18n.t("Settings")}
      </Button>
    </View>
  );
});

DrawerFooter.displayName = "DrawerFooter";

export default DrawerFooter;
