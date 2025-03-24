import React, { ComponentType, useState, useMemo, useCallback } from "react";
import {
  Animated,
  View,
  TouchableOpacity,
  Dimensions,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import { TabView, SceneMap } from "react-native-tab-view";

export type TabItem = {
  key: string;
  title: string;
  component: ComponentType<unknown>;
};

export type TabsProps = {
  items: TabItem[];
  defaultActiveKey?: string;
  indicatorWidthRatio?: number;
  TabBarContainerStyle?: StyleProp<ViewStyle>;
  TabBarContainerClassName?: string;
  TabItemStyle?: StyleProp<ViewStyle>;
  TabItemClassName?: string;
  TabTextStyle?: StyleProp<TextStyle>;
  TabTextClassName?: string;
  IndicatorStyle?: StyleProp<ViewStyle>;
  IndicatorClassName?: string;
};

const Tabs: React.FC<TabsProps> = ({
  items,
  defaultActiveKey,
  indicatorWidthRatio = 0.5,
  TabBarContainerStyle,
  TabBarContainerClassName,
  TabItemStyle,
  TabItemClassName,
  TabTextStyle,
  TabTextClassName,
  IndicatorStyle,
  IndicatorClassName,
}) => {
  const defaultIndex = useMemo(
    () =>
      Math.max(
        items.findIndex((item) => item.key === defaultActiveKey),
        0
      ),
    [items, defaultActiveKey]
  );

  const [index, setIndex] = useState(defaultIndex);
  const [tabLayout, setTabLayout] = useState<
    Record<number, { x: number; width: number; indicatorWidth: number }>
  >({});

  const routes = useMemo(
    () => items.map(({ key, title }) => ({ key, title })),
    [items]
  );

  const sceneMap = useMemo(
    () =>
      SceneMap(
        Object.fromEntries(items.map(({ key, component }) => [key, component]))
      ),
    [items]
  );

  const handleTabLayout = useCallback(
    (event: any, i: number) => {
      const { x, width } = event.nativeEvent.layout;
      const clampedRatio = Math.max(0, Math.min(1, indicatorWidthRatio));
      setTabLayout((prev) => ({
        ...prev,
        [i]: { x, width, indicatorWidth: width * clampedRatio },
      }));
    },
    [indicatorWidthRatio]
  );

  const renderTabBar = useCallback(
    ({ navigationState, position }: any) => {
      let translateX = null;
      if (Object.keys(tabLayout).length === items.length) {
        translateX = position.interpolate({
          inputRange: items.map((_, i) => i),
          outputRange: items.map((_, i) => {
            const { x, width, indicatorWidth } = tabLayout[i] || {
              x: 0,
              width: 0,
              indicatorWidth: 0,
            };
            return x + width / 2 - indicatorWidth / 2;
          }),
        });
      }

      return (
        <View
          style={[
            { flexDirection: "row", justifyContent: "center", padding: 10 },
            TabBarContainerStyle,
          ]}
          className={TabBarContainerClassName}
        >
          {navigationState.routes.map((route: any, i: number) => {
            const opacity = position.interpolate({
              inputRange: navigationState.routes.map(
                (_: any, index: any) => index
              ),
              outputRange: navigationState.routes.map((_: any, index: number) =>
                index === i ? 1 : 0.5
              ),
            });

            return (
              <TouchableOpacity
                key={route.key}
                onPress={() => setIndex(i)}
                onLayout={(e) => handleTabLayout(e, i)}
                style={[{ paddingHorizontal: 10 }, TabItemStyle]}
                className={TabItemClassName}
              >
                <Animated.Text
                  style={[{ opacity, fontSize: 16 }, TabTextStyle]}
                  className={TabTextClassName}
                >
                  {route.title}
                </Animated.Text>
              </TouchableOpacity>
            );
          })}
          <View style={{ position: "absolute", width: "100%", bottom: 0 }}>
            <Animated.View
              style={[
                {
                  height: 3,
                  width: tabLayout[index]?.indicatorWidth || 0,
                  ...(translateX ? { transform: [{ translateX }] } : {}),
                  backgroundColor: "#00a6f5",
                },
                IndicatorStyle,
              ]}
              className={IndicatorClassName}
            />
          </View>
        </View>
      );
    },
    [
      tabLayout,
      items.length,
      TabBarContainerStyle,
      TabBarContainerClassName,
      TabItemStyle,
      TabItemClassName,
      TabTextStyle,
      TabTextClassName,
      IndicatorStyle,
      IndicatorClassName,
    ]
  );

  return (
    <View style={{ flex: 1 }}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={sceneMap}
        renderTabBar={renderTabBar}
        onIndexChange={setIndex}
        initialLayout={{ width: Dimensions.get("window").width }}
      />
    </View>
  );
};

export default Tabs;
