import {
  DrawerContentScrollView,
  DrawerContentComponentProps,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";
import {
  DrawerDescriptor,
  DrawerDescriptorMap,
  DrawerNavigationHelpers,
} from "@react-navigation/drawer/lib/typescript/commonjs/src/types";
import { ReactNode } from "react";
import { Text, View } from "react-native";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../accordion";

// Define the structure for the nested drawer
type ParentNode = {
  type: "parent";
  children: NestedDrawerStruct;
};

type ChildNode = {
  type: "child";
  descriptor: DrawerDescriptor;
};

type NestedDrawerStruct = Record<string, ParentNode | ChildNode>;

/**
 * Parses the drawer descriptors to create a nested structure.
 * If all children under a parent have `drawerItemStyle.display === "none"`, that parent is removed.
 */
function getNestedDrawerStruct(
  descriptors: DrawerDescriptorMap
): NestedDrawerStruct {
  const nestedStruct: NestedDrawerStruct = {};

  for (const descriptor of Object.values(descriptors)) {
    const routeName = descriptor.route.name;
    const routePath = routeName.split("/");

    let current: NestedDrawerStruct = nestedStruct;
    routePath.forEach((segment, index) => {
      if (index < routePath.length - 1) {
        if (!current[segment]) {
          current[segment] = { type: "parent", children: {} };
        }
        current = (current[segment] as ParentNode).children;
      } else {
        const isHidden =
          typeof descriptor.options.drawerItemStyle === "object" &&
          descriptor.options.drawerItemStyle &&
          "display" in descriptor.options.drawerItemStyle &&
          descriptor.options.drawerItemStyle.display === "none";
        if (!isHidden) {
          current[segment] = { type: "child", descriptor };
        }
      }
    });
  }

  // Recursively remove empty parents
  function removeEmptyParents(node: NestedDrawerStruct): NestedDrawerStruct {
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
  }

  return removeEmptyParents(nestedStruct);
}

/**
 * Recursively renders the nested drawer structure.
 */
function renderNestedDrawer(
  struct: NestedDrawerStruct,
  navigation: DrawerNavigationHelpers,
  parentTitleMap: Record<string, string | ReactNode>,
  parentKey = ""
) {
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
              uniqueKey
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  });
}

type CustomDrawerContentComponentProps = {
  parentTitleMap?: Record<string, string | ReactNode>;
  footer?: ReactNode;
} & DrawerContentComponentProps;

/**
 * Custom drawer content with nested structure support.
 */
function CustomDrawerContent({
  parentTitleMap = {},
  footer,
  ...props
}: CustomDrawerContentComponentProps) {
  const nestedDrawerStruct = getNestedDrawerStruct(props.descriptors);

  return (
    <View className="flex justify-between flex-1 bg-white">
      <DrawerContentScrollView {...props}>
        {renderNestedDrawer(
          nestedDrawerStruct,
          props.navigation,
          parentTitleMap
        )}
      </DrawerContentScrollView>
      {footer ? footer : undefined}
    </View>
  );
}

export default CustomDrawerContent;
