import { Header } from "@react-navigation/elements";
import React, { useCallback, useState } from "react";
import { GestureResponderEvent, Pressable, View } from "react-native";
import {
  LanguageIcon,
  Bars3BottomRightIcon,
} from "react-native-heroicons/solid";
import { useDevice } from "@/hooks/useDevice";
import { useLocale } from "@/context/Locale";
import { useNavigationContainerRef } from "expo-router";
import { DrawerActions } from "@react-navigation/native";
import { Avatar } from "./Avatar";
import { useAuth } from "@/context/Auth";
import UserModal from "./UserModal";

type HeaderProps = React.ComponentProps<typeof Header>;

export function DrawerHeader({ ...props }: HeaderProps) {
  const { user, loading: isUserLoading } = useAuth();
  const { isLargeScreen } = useDevice();
  const { locale, changeLocale } = useLocale();
  const navigation = useNavigationContainerRef();
  const [usrModalVisible, setUsrModalVisable] = useState(false);

  // Toggle drawer menu
  const handleToggleMenu = (e: GestureResponderEvent) => {
    navigation.dispatch(DrawerActions.toggleDrawer());
  };

  // Change locale
  const handleChangeLocale = useCallback(() => {
    const newLocale = locale === "en" ? "zh" : "en";
    changeLocale(newLocale);
  }, [locale, changeLocale]);

  const handleAvatarPress = () => {
    // router.navigate("/user");
    setUsrModalVisable(!usrModalVisible);
  };

  return (
    <View className="shadow-sm shadow-zinc-800">
      <UserModal isVisible={usrModalVisible} setVisible={setUsrModalVisable} />
      <Header
        {...props}
        headerRight={() => (
          <>
            <Avatar
              text={user?.username}
              size="small"
              onPress={handleAvatarPress}
              isLoading={isUserLoading}
            />
            <Pressable
              onPress={handleChangeLocale}
              className="p-2 rounded mr-1"
            >
              <LanguageIcon
                size={24}
                className="text-zinc-600 hover:text-zinc-500"
              />
            </Pressable>
            {!isLargeScreen && (
              <Pressable
                onPress={handleToggleMenu}
                className="p-2 rounded mr-1"
              >
                <Bars3BottomRightIcon
                  size={24}
                  className="text-zinc-600 hover:text-zinc-500"
                />
              </Pressable>
            )}
          </>
        )}
      />
    </View>
  );
}
