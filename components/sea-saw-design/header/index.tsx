import { Header } from "@react-navigation/elements";
import React, { useCallback, useState } from "react";
import { GestureResponderEvent, Pressable, View } from "react-native";
import {
  LanguageIcon,
  Bars3BottomRightIcon,
} from "react-native-heroicons/solid";
import { useDevice } from "@/hooks/useDevice";
import { useLocale } from "@/context/Locale";
import { useNavigationContainerRef, usePathname, useRouter } from "expo-router";
import { DrawerActions } from "@react-navigation/native";
import UserModal from "./UserModal";
import { HeaderTitle } from "./CustomHeaderTitle";
import { CustomAvatar } from "./CustomAvatar";

type HeaderProps = React.ComponentProps<typeof Header>;

export function DrawerHeader({ ...props }: HeaderProps) {
  const { isLargeScreen } = useDevice();
  const { locale, changeLocale } = useLocale();
  const navigation = useNavigationContainerRef();
  const [usrModalVisible, setUsrModalVisable] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleToggleMenu = (e: GestureResponderEvent) => {
    navigation.dispatch(DrawerActions.toggleDrawer());
  };

  const handleChangeLocale = useCallback(() => {
    changeLocale(locale === "en" ? "zh" : "en");
  }, [locale, changeLocale]);

  return (
    <View className="shadow-sm shadow-zinc-800">
      <UserModal isVisible={usrModalVisible} setVisible={setUsrModalVisable} />
      <Header
        {...props}
        headerTitleAlign="left"
        headerRight={() => (
          <>
            {pathname !== "/login" ? <CustomAvatar /> : null}
            <Pressable
              onPress={handleChangeLocale}
              className="p-2 rounded mr-1"
            >
              <LanguageIcon
                size={24}
                className="text-zinc-600 hover:text-zinc-500"
              />
            </Pressable>
          </>
        )}
        headerLeft={() => {
          return (
            <>
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
          );
        }}
        headerTitle={(props) => (
          <HeaderTitle
            {...props}
            onPress={() => {
              router.navigate("/");
            }}
          />
        )}
      />
    </View>
  );
}
