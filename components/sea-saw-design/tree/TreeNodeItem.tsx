import * as React from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import { cn } from "../utils";
import { useTreeContext } from "./context";
import { AnimatedSwitcher } from "./AnimatedSwitcher";
import { TreeCheckbox } from "./TreeCheckbox";
import { IndentGuides } from "./IndentGuides";
import type { TreeDataNode } from "./types";

interface TreeNodeItemProps {
  node: TreeDataNode;
  depth: number;
  guideLines: boolean[];
  isLastChild: boolean;
}

export const TreeNodeItem = React.memo(function TreeNodeItem({
  node,
  depth,
  guideLines,
  isLastChild,
}: TreeNodeItemProps) {
  const {
    expandedKeysSet,
    handleToggleExpand,
    selectable,
    selectedKeysSet,
    handleToggleSelect,
    checkable,
    checkedKeysSet,
    halfCheckedKeysSet,
    handleToggleCheck,
    showLine,
    showIcon,
    blockNode,
    disabled: treeDisabled,
    indent,
    icon: treeIcon,
    switcherIcon,
    titleRender,
    filterTreeNode,
    loadData,
    loadedKeysSet,
    loadingKeysSet,
  } = useTreeContext();

  const nodeDisabled = treeDisabled || node.disabled;
  const nodeSelectable = node.selectable !== undefined ? node.selectable : selectable;

  const isExpanded = expandedKeysSet.has(node.key);
  const isSelected = selectedKeysSet.has(node.key);
  const isChecked = checkedKeysSet.has(node.key);
  const isHalfChecked = halfCheckedKeysSet.has(node.key);
  const isLoading = loadingKeysSet.has(node.key);
  const hasChildren = (node.children?.length ?? 0) > 0;
  const isLeaf =
    node.isLeaf ??
    (!hasChildren && (loadData ? loadedKeysSet.has(node.key) : true));
  const isFiltered = filterTreeNode ? filterTreeNode(node) : false;

  const resolvedIcon = React.useMemo(() => {
    const iconSource = node.icon ?? treeIcon;
    if (!iconSource) return null;
    return typeof iconSource === "function" ? iconSource(node) : iconSource;
  }, [node, treeIcon]);

  const title = React.useMemo(() => {
    if (titleRender) return titleRender(node);
    if (typeof node.title === "string" || typeof node.title === "number") {
      return (
        <Text
          className={cn(
            "text-sm text-foreground flex-1",
            nodeDisabled && "opacity-40",
            isFiltered && "text-primary font-medium",
          )}
          numberOfLines={1}
        >
          {node.title}
        </Text>
      );
    }
    return node.title ?? null;
  }, [titleRender, node, nodeDisabled, isFiltered]);

  const childGuideLines = React.useMemo(
    () => [...guideLines, !isLastChild],
    [guideLines, isLastChild],
  );

  const rowBg = cn(
    "flex-row items-center min-h-[32px] web:cursor-pointer",
    blockNode && "w-full",
    isSelected && !nodeDisabled && "bg-primary/10",
    isFiltered && !isSelected && "bg-yellow-50",
    nodeDisabled
      ? "web:cursor-not-allowed"
      : "active:bg-secondary web:hover:bg-secondary/60",
  );

  return (
    <View>
      <Pressable
        disabled={nodeDisabled}
        onPress={
          nodeSelectable !== false ? e => handleToggleSelect(node, e) : undefined
        }
        className={rowBg}
        style={node.style}
        accessibilityRole="none"
        accessibilityState={{
          expanded: !isLeaf ? isExpanded : undefined,
          selected: isSelected,
          disabled: nodeDisabled,
        }}
      >
        {showLine ? (
          <IndentGuides depth={depth} guideLines={guideLines} indent={indent} />
        ) : (
          <View style={{ width: depth * indent }} />
        )}

        <Pressable
          onPress={isLeaf || nodeDisabled ? undefined : e => handleToggleExpand(node, e)}
          hitSlop={4}
          className="p-0.5"
        >
          <AnimatedSwitcher
            expanded={isExpanded}
            isLeaf={isLeaf}
            loading={isLoading}
            custom={node.switcherIcon ?? switcherIcon}
          />
        </Pressable>

        {checkable && node.checkable !== false && (
          <TreeCheckbox
            checked={isChecked}
            halfChecked={isHalfChecked}
            disabled={nodeDisabled || node.disableCheckbox}
            onPress={() => handleToggleCheck(node)}
          />
        )}

        {(showIcon || node.icon) && resolvedIcon != null && (
          <View className="mr-1">{resolvedIcon}</View>
        )}

        <View className="flex-1 flex-row items-center">{title}</View>
      </Pressable>

      {!isLeaf && isExpanded && (node.children?.length ?? 0) > 0 && (
        <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(100)}>
          {node.children!.map((child, idx) => (
            <TreeNodeItem
              key={child.key}
              node={child}
              depth={depth + 1}
              guideLines={childGuideLines}
              isLastChild={idx === node.children!.length - 1}
            />
          ))}
        </Animated.View>
      )}
    </View>
  );
});

TreeNodeItem.displayName = "TreeNodeItem";
