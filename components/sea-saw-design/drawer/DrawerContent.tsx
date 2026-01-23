import React, { useMemo } from "react";
import {
  DrawerContentScrollView,
  DrawerContentComponentProps,
  DrawerItem,
} from "@react-navigation/drawer";
import { ReactNode } from "react";
import { Text, View } from "react-native";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../accordion";
import type { NestedDrawerStruct, ParentNode, ParentTitleMap } from "./types";

// Infer types from DrawerContentComponentProps
type DrawerDescriptorMap = DrawerContentComponentProps["descriptors"];
type DrawerNavigationHelpers = DrawerContentComponentProps["navigation"];
type DrawerDescriptor = DrawerDescriptorMap[string];

/**
 * Checks if a descriptor should be hidden based on drawerItemStyle
 */
const isDescriptorHidden = (descriptor: DrawerDescriptor): boolean => {
  const style = descriptor.options.drawerItemStyle;
  return (
    typeof style === "object" &&
    style !== null &&
    "display" in style &&
    style.display === "none"
  );
};

/**
 * Recursively removes empty parent nodes
 */
const removeEmptyParents = (node: NestedDrawerStruct): NestedDrawerStruct => {
  const filteredNode: NestedDrawerStruct = {};

  for (const [key, value] of Object.entries(node)) {
    if (value.type === "child") {
      filteredNode[key] = value;
    } else {
      const cleanedChildren = removeEmptyParents(value.children);
      if (Object.keys(cleanedChildren).length > 0) {
        filteredNode[key] = { type: "parent", children: cleanedChildren };
      }
    }
  }

  return filteredNode;
};

/**
 * Parses the drawer descriptors to create a nested structure.
 * Filters out hidden items and removes empty parent nodes.
 */
const buildNestedDrawerStruct = (
  descriptors: DrawerDescriptorMap,
): NestedDrawerStruct => {
  const nestedStruct: NestedDrawerStruct = {};

  for (const descriptor of Object.values(descriptors)) {
    const routeName = descriptor.route.name;
    const routePath = routeName.split("/");

    let current: NestedDrawerStruct = nestedStruct;

    routePath.forEach((segment: string, index: number) => {
      const isLastSegment = index === routePath.length - 1;

      if (isLastSegment) {
        if (!isDescriptorHidden(descriptor)) {
          current[segment] = { type: "child", descriptor };
        }
      } else {
        if (!current[segment]) {
          current[segment] = { type: "parent", children: {} };
        }
        current = (current[segment] as ParentNode).children;
      }
    });
  }

  return removeEmptyParents(nestedStruct);
};

/**
 * Recursively renders the nested drawer structure.
 */
const renderNestedDrawer = (
  struct: NestedDrawerStruct,
  navigation: DrawerNavigationHelpers,
  parentTitleMap: ParentTitleMap,
  parentKey = "",
): React.ReactElement[] => {
  return Object.entries(struct).map(([key, val]) => {
    const uniqueKey = parentKey ? `${parentKey}/${key}` : key;

    if (val.type === "child") {
      const { descriptor } = val;
      const { drawerLabel = key, drawerItemStyle } = descriptor.options;
      return (
        <DrawerItem
          key={uniqueKey}
          label={drawerLabel}
          onPress={() => navigation.navigate(descriptor.route.name)}
          style={drawerItemStyle}
        />
      );
    }

    const displayLabel = parentTitleMap[uniqueKey] ?? key;

    return (
      <Accordion key={uniqueKey} type="multiple" collapsible className="w-full">
        <AccordionItem value={uniqueKey} className="border-none">
          <AccordionTrigger
            className="hover:bg-gray-100 px-4 rounded-md"
            IconClassName="text-[#1c1c1ead]"
          >
            {typeof displayLabel === "string" ? (
              <Text className="font-semibold text-[#1c1c1ead]">
                {displayLabel}
              </Text>
            ) : (
              displayLabel
            )}
          </AccordionTrigger>
          <AccordionContent>
            {renderNestedDrawer(
              val.children,
              navigation,
              parentTitleMap,
              uniqueKey,
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  });
};

export type CustomDrawerContentProps = {
  parentTitleMap?: ParentTitleMap;
  footer?: ReactNode;
} & DrawerContentComponentProps;

/**
 * Custom drawer content with nested structure support for native platforms.
 * Uses accordion-style navigation for nested routes.
 */
export const CustomDrawerContent = React.memo<CustomDrawerContentProps>(
  ({ parentTitleMap = {}, footer, ...props }) => {
    // Memoize nested structure to avoid recalculation on every render
    const nestedDrawerStruct = useMemo(
      () => buildNestedDrawerStruct(props.descriptors),
      [props.descriptors],
    );

    // Memoize rendered content
    const drawerContent = useMemo(
      () =>
        renderNestedDrawer(
          nestedDrawerStruct,
          props.navigation,
          parentTitleMap,
        ),
      [nestedDrawerStruct, props.navigation, parentTitleMap],
    );

    return (
      <View className="flex justify-between flex-1 bg-white">
        <DrawerContentScrollView {...props}>
          {drawerContent}
        </DrawerContentScrollView>
        {footer}
      </View>
    );
  },
);

CustomDrawerContent.displayName = "CustomDrawerContent";

export default CustomDrawerContent;
