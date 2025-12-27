import React, { useMemo } from "react";
import { View, Pressable } from "react-native";
import { Menu } from "antd";
import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { ReactNode } from "react";
import { usePathname } from "expo-router";
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/20/solid";

/** ---------- Types ---------- */
type ParentNode = {
  type: "parent";
  children: NestedDrawerStruct;
};

type ChildNode = {
  type: "child";
  routeName: string;
  drawerLabel?: ReactNode;
  drawerItemStyle?: any;
};

type NestedDrawerStruct = Record<string, ParentNode | ChildNode>;

type CustomDrawerMenuProps = {
  parentTitleMap?: Record<string, string | ReactNode>;
  parentIconMap?: Record<string, ReactNode>;
  footer?: ReactNode;
  collapsed?: boolean;
  setCollapsed?: (v: boolean) => void;
} & DrawerContentComponentProps;

/** ---------- Build Nested Menu Struct ---------- */
function buildNestedStruct(
  descriptors: Record<string, any>
): NestedDrawerStruct {
  const root: NestedDrawerStruct = {};

  for (const d of Object.values(descriptors)) {
    const routeName = d.route.name; // e.g. (crm)/company
    const segments = routeName.split("/");
    let current = root;

    segments.forEach((seg: string, idx: number) => {
      const isLast = idx === segments.length - 1;

      if (isLast) {
        const hidden = d.options.drawerItemStyle?.display === "none";
        if (!hidden) {
          current[seg] = {
            type: "child",
            routeName,
            drawerLabel: d.options.drawerLabel,
            drawerItemStyle: d.options.drawerItemStyle,
          };
        }
      } else {
        if (!current[seg]) {
          current[seg] = { type: "parent", children: {} };
        }
        current = (current[seg] as ParentNode).children;
      }
    });
  }

  return removeEmptyParents(root);
}

/** ---------- Remove empty parents ---------- */
function removeEmptyParents(struct: NestedDrawerStruct): NestedDrawerStruct {
  const filtered: NestedDrawerStruct = {};

  for (const [key, val] of Object.entries(struct)) {
    if (val.type === "child") filtered[key] = val;
    else {
      const child = removeEmptyParents(val.children);
      if (Object.keys(child).length > 0)
        filtered[key] = { type: "parent", children: child };
    }
  }

  return filtered;
}

/** ---------- Convert to Antd Menu items ---------- */
function structToMenuItems(
  struct: NestedDrawerStruct,
  parentTitleMap: Record<string, ReactNode>,
  parentIconMap: Record<string, ReactNode>,
  navigation: any,
  prefix = ""
): any[] {
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
        fullPath
      ),
    };
  });
}

/** ---------- Component ---------- */
export default function CustomDrawerContent({
  parentTitleMap = {},
  parentIconMap = {},
  footer,
  descriptors,
  navigation,
  collapsed = false,
  setCollapsed,
}: CustomDrawerMenuProps) {
  const pathname = usePathname(); // 当前路径，例如 /crm/company

  /** 当前选中的 Drawer routeName */
  const selectedKey = useMemo(() => {
    const keys = Object.values(descriptors).map((d) => d.route.name);
    return keys.find((k) => pathname.includes(k)) ?? "index";
  }, [pathname, descriptors]);

  const nestedStruct = useMemo(
    () => buildNestedStruct(descriptors),
    [descriptors]
  );

  const menuItems = useMemo(
    () =>
      structToMenuItems(
        nestedStruct,
        parentTitleMap,
        parentIconMap,
        navigation
      ),
    [nestedStruct, parentTitleMap, parentIconMap]
  );

  /** 自动展开父菜单 */
  const openKeys = useMemo(() => {
    const found = menuItems
      .map((item: any) => item.key)
      .filter((k: string) => pathname.includes(k));
    return found;
  }, [pathname, menuItems]);

  return (
    <View style={{ flex: 1, justifyContent: "space-between" }}>
      {/* MENU */}
      <Menu
        mode="inline"
        items={menuItems}
        selectedKeys={[selectedKey]}
        defaultOpenKeys={openKeys}
        inlineCollapsed={collapsed}
        style={{ width: "100%", flex: 1 }}
      />

      {/* COLLAPSE BUTTON */}
      <Pressable
        onPress={() => setCollapsed?.(!collapsed)}
        className="absolute -right-5 bottom-3 bg-sky-900 p-2 rounded-full hover:bg-sky-600"
        style={{ pointerEvents: "auto" }}
      >
        {collapsed ? (
          <ChevronDoubleRightIcon className="size-5 text-white" />
        ) : (
          <ChevronDoubleLeftIcon className="size-5 text-white" />
        )}
      </Pressable>

      {/* FOOTER */}
      {footer}
    </View>
  );
}
