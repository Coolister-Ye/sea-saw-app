/**
 * Tree — React Native / NativeWind tree component
 *
 * API mirrors antd's Tree:
 *   https://ant.design/components/tree
 */

import * as React from "react";
import { View } from "react-native";
import { cn } from "../utils";
import { TreeContext, type TreeContextValue } from "./context";
import { TreeNodeItem } from "./TreeNodeItem";
import {
  buildNodeMap,
  buildParentMap,
  computeFullCheckState,
  getAncestorKeys,
  getCheckableSubtreeKeys,
} from "./utils";
import type {
  CheckInfo,
  ExpandInfo,
  SelectInfo,
  TreeDataNode,
  TreeKey,
  TreeProps,
} from "./types";

function Tree(props: TreeProps, ref: React.ForwardedRef<View>) {
  const {
    treeData = [],
    // Expand
    defaultExpandAll = false,
    defaultExpandedKeys,
    expandedKeys: expandedKeysProp,
    autoExpandParent = true,
    onExpand,
    // Select
    selectable = true,
    multiple = false,
    defaultSelectedKeys,
    selectedKeys: selectedKeysProp,
    onSelect,
    // Check
    checkable = false,
    checkStrictly = false,
    defaultCheckedKeys,
    checkedKeys: checkedKeysProp,
    onCheck,
    // Appearance
    showLine = false,
    showIcon = false,
    blockNode = false,
    disabled = false,
    indent = 24,
    // Rendering
    icon,
    switcherIcon,
    titleRender,
    filterTreeNode,
    // Async
    loadData,
    loadedKeys: loadedKeysProp,
    onLoad,
    // Style
    className,
    style,
  } = props;

  /* ── Stable data maps ─────────────────────────────────────────────── */
  const nodeMap = React.useMemo(() => buildNodeMap(treeData), [treeData]);
  const parentMap = React.useMemo(() => buildParentMap(treeData), [treeData]);

  /* ── showLine options ─────────────────────────────────────────────── */
  const showLineEnabled = Boolean(showLine);
  const showLeafIcon =
    typeof showLine === "object" ? (showLine.showLeafIcon ?? true) : true;

  /* ── Expand state ─────────────────────────────────────────────────── */
  const isExpandControlled = expandedKeysProp !== undefined;

  const computeDefaultExpanded = React.useCallback((): TreeKey[] => {
    if (defaultExpandAll) return Array.from(nodeMap.keys());
    if (defaultExpandedKeys) return [...defaultExpandedKeys];
    return [];
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [internalExpanded, setInternalExpanded] = React.useState<TreeKey[]>(
    computeDefaultExpanded,
  );
  const expandedKeys = isExpandControlled ? expandedKeysProp! : internalExpanded;
  const expandedKeysSet = React.useMemo(() => new Set(expandedKeys), [expandedKeys]);

  /* ── Select state ─────────────────────────────────────────────────── */
  const isSelectControlled = selectedKeysProp !== undefined;
  const [internalSelected, setInternalSelected] = React.useState<TreeKey[]>(
    defaultSelectedKeys ?? [],
  );
  const selectedKeys = isSelectControlled ? selectedKeysProp! : internalSelected;
  const selectedKeysSet = React.useMemo(() => new Set(selectedKeys), [selectedKeys]);

  /* ── Check state ──────────────────────────────────────────────────── */
  const isCheckControlled = checkedKeysProp !== undefined;

  const resolveCheckedKeys = (
    raw?: TreeKey[] | { checked: TreeKey[]; halfChecked: TreeKey[] },
  ): TreeKey[] => {
    if (!raw) return [];
    return Array.isArray(raw) ? raw : raw.checked;
  };

  const [internalBaseChecked, setInternalBaseChecked] = React.useState<Set<TreeKey>>(
    () => new Set(resolveCheckedKeys(defaultCheckedKeys)),
  );

  const { checked: checkedKeysSet, halfChecked: halfCheckedKeysSet } =
    React.useMemo(() => {
      if (checkStrictly) {
        const raw = isCheckControlled
          ? resolveCheckedKeys(checkedKeysProp)
          : Array.from(internalBaseChecked);
        const half: TreeKey[] =
          isCheckControlled && !Array.isArray(checkedKeysProp)
            ? (checkedKeysProp as { checked: TreeKey[]; halfChecked: TreeKey[] })
                .halfChecked
            : [];
        return { checked: new Set(raw), halfChecked: new Set(half) };
      }
      const base = isCheckControlled
        ? new Set(resolveCheckedKeys(checkedKeysProp))
        : internalBaseChecked;
      return computeFullCheckState(treeData, base);
    }, [checkStrictly, isCheckControlled, checkedKeysProp, internalBaseChecked, treeData]);

  /* ── Async loading state ──────────────────────────────────────────── */
  const isLoadedControlled = loadedKeysProp !== undefined;
  const [internalLoadedKeys, setInternalLoadedKeys] = React.useState<TreeKey[]>([]);
  const loadedKeys = isLoadedControlled ? loadedKeysProp! : internalLoadedKeys;
  const loadedKeysSet = React.useMemo(() => new Set(loadedKeys), [loadedKeys]);
  const [loadingKeysSet, setLoadingKeysSet] = React.useState<Set<TreeKey>>(new Set());

  /* ── Handlers ─────────────────────────────────────────────────────── */

  const handleToggleExpand = React.useCallback(
    (node: TreeDataNode, nativeEvent: any) => {
      const wasExpanded = expandedKeysSet.has(node.key);

      if (
        !wasExpanded &&
        loadData &&
        !loadedKeysSet.has(node.key) &&
        !loadingKeysSet.has(node.key)
      ) {
        setLoadingKeysSet(prev => new Set([...prev, node.key]));
        loadData(node).then(() => {
          setLoadingKeysSet(prev => {
            const next = new Set(prev);
            next.delete(node.key);
            return next;
          });
          if (!isLoadedControlled) {
            setInternalLoadedKeys(prev => [...prev, node.key]);
          }
          onLoad?.([...loadedKeysSet, node.key], { event: "load", node });
        });
        return;
      }

      let nextKeys: TreeKey[];
      if (wasExpanded) {
        nextKeys = expandedKeys.filter(k => k !== node.key);
      } else {
        nextKeys = [...expandedKeys, node.key];
        if (autoExpandParent && !isExpandControlled) {
          const ancestors = getAncestorKeys(node.key, parentMap);
          for (const ak of ancestors) {
            if (!nextKeys.includes(ak)) nextKeys.push(ak);
          }
        }
      }

      if (!isExpandControlled) setInternalExpanded(nextKeys);
      onExpand?.(nextKeys, { node, expanded: !wasExpanded, nativeEvent } as ExpandInfo);
    },
    [
      expandedKeysSet,
      expandedKeys,
      loadData,
      loadedKeysSet,
      loadingKeysSet,
      isLoadedControlled,
      isExpandControlled,
      autoExpandParent,
      parentMap,
      onExpand,
      onLoad,
    ],
  );

  const handleToggleSelect = React.useCallback(
    (node: TreeDataNode, nativeEvent: any) => {
      if (disabled || node.disabled) return;
      const nodeSelectable = node.selectable !== undefined ? node.selectable : selectable;
      if (!nodeSelectable) return;

      const wasSelected = selectedKeysSet.has(node.key);
      let nextKeys: TreeKey[];

      if (wasSelected) {
        nextKeys = selectedKeys.filter(k => k !== node.key);
      } else if (multiple) {
        nextKeys = [...selectedKeys, node.key];
      } else {
        nextKeys = [node.key];
      }

      if (!isSelectControlled) setInternalSelected(nextKeys);

      const selectedNodes = nextKeys
        .map(k => nodeMap.get(k))
        .filter(Boolean) as TreeDataNode[];

      const info: SelectInfo = { node, selected: !wasSelected, selectedNodes, nativeEvent };
      onSelect?.(nextKeys, info);
    },
    [disabled, selectable, selectedKeysSet, selectedKeys, multiple, isSelectControlled, nodeMap, onSelect],
  );

  const handleToggleCheck = React.useCallback(
    (node: TreeDataNode) => {
      if (disabled || node.disabled || node.disableCheckbox) return;

      const wasChecked = checkedKeysSet.has(node.key);
      let nextBase: Set<TreeKey>;

      if (checkStrictly) {
        nextBase = new Set(internalBaseChecked);
        if (wasChecked) nextBase.delete(node.key);
        else nextBase.add(node.key);
      } else {
        nextBase = new Set(internalBaseChecked);
        const subtreeKeys = getCheckableSubtreeKeys(node);
        if (wasChecked) subtreeKeys.forEach(k => nextBase.delete(k));
        else subtreeKeys.forEach(k => nextBase.add(k));
      }

      if (!isCheckControlled) setInternalBaseChecked(nextBase);

      const { checked: nextChecked, halfChecked: nextHalfChecked } = checkStrictly
        ? { checked: nextBase, halfChecked: new Set<TreeKey>() }
        : computeFullCheckState(treeData, nextBase);

      const checkedNodes = Array.from(nextChecked)
        .map(k => nodeMap.get(k))
        .filter(Boolean) as TreeDataNode[];

      const info: CheckInfo = {
        node,
        checked: !wasChecked,
        checkedNodes,
        halfCheckedKeys: Array.from(nextHalfChecked),
      };

      const result = checkStrictly
        ? { checked: Array.from(nextChecked), halfChecked: Array.from(nextHalfChecked) }
        : Array.from(nextChecked);

      onCheck?.(result, info);
    },
    [disabled, checkedKeysSet, checkStrictly, internalBaseChecked, isCheckControlled, treeData, nodeMap, onCheck],
  );

  /* ── Context value ────────────────────────────────────────────────── */
  const contextValue = React.useMemo<TreeContextValue>(
    () => ({
      expandedKeysSet,
      handleToggleExpand,
      selectable,
      multiple,
      selectedKeysSet,
      handleToggleSelect,
      checkable,
      checkStrictly,
      checkedKeysSet,
      halfCheckedKeysSet,
      handleToggleCheck,
      showLine: showLineEnabled,
      showLeafIcon,
      showIcon,
      blockNode,
      disabled,
      indent,
      icon,
      switcherIcon,
      titleRender,
      filterTreeNode,
      loadData,
      loadedKeysSet,
      loadingKeysSet,
      nodeMap,
    }),
    [
      expandedKeysSet, handleToggleExpand,
      selectable, multiple, selectedKeysSet, handleToggleSelect,
      checkable, checkStrictly, checkedKeysSet, halfCheckedKeysSet, handleToggleCheck,
      showLineEnabled, showLeafIcon, showIcon, blockNode, disabled, indent,
      icon, switcherIcon, titleRender, filterTreeNode,
      loadData, loadedKeysSet, loadingKeysSet, nodeMap,
    ],
  );

  /* ── Render ───────────────────────────────────────────────────────── */
  return (
    <TreeContext.Provider value={contextValue}>
      <View ref={ref} className={cn("flex-col", className)} style={style}>
        {treeData.map((node, idx) => (
          <TreeNodeItem
            key={node.key}
            node={node}
            depth={0}
            guideLines={[]}
            isLastChild={idx === treeData.length - 1}
          />
        ))}
      </View>
    </TreeContext.Provider>
  );
}

const TreeWithRef = React.forwardRef(Tree);
TreeWithRef.displayName = "Tree";

export { TreeWithRef as Tree };
export type {
  TreeDataNode,
  TreeKey,
  TreeProps,
  SwitcherIconProps,
  ExpandInfo,
  SelectInfo,
  CheckInfo,
  LoadInfo,
} from "./types";
