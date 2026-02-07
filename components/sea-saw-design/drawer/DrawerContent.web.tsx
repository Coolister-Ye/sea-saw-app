import React, { useMemo, useCallback } from "react";
import { View, Pressable } from "react-native";
import { Menu, type MenuProps } from "antd";
import type { DrawerContentComponentProps } from "@react-navigation/drawer";
import { ReactNode } from "react";
import { usePathname } from "expo-router";
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/20/solid";
import type { ParentTitleMap, ParentIconMap } from "./types";

/** ---------- Types ---------- */

// Infer types from DrawerContentComponentProps
type DrawerDescriptorMap = DrawerContentComponentProps["descriptors"];
type DrawerNavigationHelpers = DrawerContentComponentProps["navigation"];
type DrawerDescriptor = DrawerDescriptorMap[string];

/** Web-specific child node structure */
type WebChildNode = {
  type: "child";
  routeName: string;
  drawerLabel?: ReactNode;
  drawerItemStyle?: any;
};

/** Web-specific parent node structure */
type WebParentNode = {
  type: "parent";
  children: WebNestedDrawerStruct;
};

/** Web-specific nested drawer structure */
type WebNestedDrawerStruct = Record<string, WebParentNode | WebChildNode>;

export type CustomDrawerContentProps = {
  parentTitleMap?: ParentTitleMap;
  parentIconMap?: ParentIconMap;
  footer?: ReactNode;
  collapsed?: boolean;
  setCollapsed?: (value: boolean) => void;
} & DrawerContentComponentProps;

/** ---------- Helper Functions ---------- */

/**
 * Checks if a descriptor should be hidden based on drawerItemStyle
 */
const isDescriptorHidden = (descriptor: DrawerDescriptor): boolean => {
  const style = descriptor.options.drawerItemStyle;
  return (
    typeof style === "object" &&
    style !== null &&
    !Array.isArray(style) &&
    "display" in style &&
    (style as any).display === "none"
  );
};

/**
 * Recursively removes empty parent nodes
 */
const removeEmptyParents = (
  struct: WebNestedDrawerStruct,
): WebNestedDrawerStruct => {
  const filtered: WebNestedDrawerStruct = {};

  for (const [key, val] of Object.entries(struct)) {
    if (val.type === "child") {
      filtered[key] = val;
    } else {
      const cleanedChildren = removeEmptyParents(val.children);
      if (Object.keys(cleanedChildren).length > 0) {
        filtered[key] = { type: "parent", children: cleanedChildren };
      }
    }
  }

  return filtered;
};

/**
 * Gets the label from drawer options, handling function labels
 */
const getDrawerLabel = (
  label:
    | string
    | ((props: { color: string; focused: boolean }) => ReactNode)
    | undefined,
): ReactNode => {
  if (typeof label === "function") {
    // Call the function with default props for static rendering
    return label({ color: "#000", focused: false });
  }
  return label;
};

/**
 * Builds a nested structure from drawer descriptors
 */
const buildNestedStruct = (
  descriptors: DrawerDescriptorMap,
): WebNestedDrawerStruct => {
  const root: WebNestedDrawerStruct = {};

  for (const descriptor of Object.values(descriptors)) {
    const routeName = descriptor.route.name;
    const segments = routeName.split("/");
    let current = root;

    segments.forEach((segment: string, index: number) => {
      const isLastSegment = index === segments.length - 1;

      if (isLastSegment) {
        if (!isDescriptorHidden(descriptor)) {
          current[segment] = {
            type: "child",
            routeName,
            drawerLabel: getDrawerLabel(descriptor.options.drawerLabel),
            drawerItemStyle: descriptor.options.drawerItemStyle,
          };
        }
      } else {
        if (!current[segment]) {
          current[segment] = { type: "parent", children: {} };
        }
        current = (current[segment] as WebParentNode).children;
      }
    });
  }

  return removeEmptyParents(root);
};

/**
 * Converts nested structure to Ant Design Menu items
 */
const structToMenuItems = (
  struct: WebNestedDrawerStruct,
  parentTitleMap: ParentTitleMap,
  parentIconMap: ParentIconMap,
  navigation: DrawerNavigationHelpers,
  prefix = "",
): MenuProps["items"] => {
  return Object.entries(struct).map(([key, val]) => {
    const fullPath = prefix ? `${prefix}/${key}` : key;

    if (val.type === "child") {
      return {
        key: val.routeName,
        icon: parentIconMap[fullPath],
        label: val.drawerLabel ?? key,
        onClick: () => navigation.navigate(val.routeName),
      };
    }

    return {
      key: fullPath,
      icon: parentIconMap[fullPath],
      label: parentTitleMap[fullPath] ?? key,
      children: structToMenuItems(
        val.children,
        parentTitleMap,
        parentIconMap,
        navigation,
        fullPath,
      ),
    };
  });
};

/**
 * Finds the currently selected key based on pathname
 */
const findSelectedKey = (
  pathname: string,
  descriptors: DrawerDescriptorMap,
): string => {
  const keys = Object.values(descriptors).map((d) => d.route.name);
  return keys.find((k) => pathname.includes(k)) ?? "index";
};

/**
 * Finds parent menu keys that should be opened based on pathname
 */
const findOpenKeys = (
  pathname: string,
  menuItems: MenuProps["items"],
): string[] => {
  if (!menuItems) return [];

  return menuItems
    .map((item: any) => item.key)
    .filter((k: string) => pathname.includes(k));
};

/** ---------- Component ---------- */

/**
 * Custom drawer content for web platform.
 * Uses Ant Design Menu component with collapsible functionality.
 */
export const CustomDrawerContent = React.memo<CustomDrawerContentProps>(
  ({
    parentTitleMap = {},
    parentIconMap = {},
    footer,
    descriptors,
    navigation,
    collapsed = false,
    setCollapsed,
  }) => {
    const pathname = usePathname();

    // Memoize nested structure
    const nestedStruct = useMemo(
      () => buildNestedStruct(descriptors),
      [descriptors],
    );

    // Memoize menu items
    const menuItems = useMemo(
      () =>
        structToMenuItems(
          nestedStruct,
          parentTitleMap,
          parentIconMap,
          navigation,
        ),
      [nestedStruct, parentTitleMap, parentIconMap, navigation],
    );

    // Find selected key
    const selectedKey = useMemo(
      () => findSelectedKey(pathname, descriptors),
      [pathname, descriptors],
    );

    // Find keys that should be opened
    const openKeys = useMemo(
      () => findOpenKeys(pathname, menuItems),
      [pathname, menuItems],
    );

    // Toggle collapsed state
    const handleToggleCollapse = useCallback(() => {
      setCollapsed?.(!collapsed);
    }, [collapsed, setCollapsed]);

    return (
      <View style={{ flex: 1, position: "relative" }}>
        {/* Menu */}
        <Menu
          mode="inline"
          items={menuItems}
          selectedKeys={[selectedKey]}
          defaultOpenKeys={openKeys}
          inlineCollapsed={collapsed}
          style={{ width: "100%", flex: 1, borderRight: "none" }}
        />

        {/* Footer */}
        {footer}

        {/* Collapse Toggle Button */}
        <Pressable
          onPress={handleToggleCollapse}
          style={{
            position: "absolute",
            right: -12,
            top: "50%",
            transform: [{ translateY: -16 }],
            width: 24,
            height: 32,
            backgroundColor: "#f0f0f0",
            borderRadius: 4,
            borderWidth: 1,
            borderColor: "#d9d9d9",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            zIndex: 100,
          }}
          accessibilityLabel={collapsed ? "Expand menu" : "Collapse menu"}
          accessibilityRole="button"
        >
          {collapsed ? (
            <ChevronDoubleRightIcon
              style={{ width: 14, height: 14, color: "#595959" }}
            />
          ) : (
            <ChevronDoubleLeftIcon
              style={{ width: 14, height: 14, color: "#595959" }}
            />
          )}
        </Pressable>
      </View>
    );
  },
);

CustomDrawerContent.displayName = "CustomDrawerContent";

export default CustomDrawerContent;
