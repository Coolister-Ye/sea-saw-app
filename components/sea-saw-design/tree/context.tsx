import * as React from "react";
import type { TreeDataNode, TreeKey, TreeProps } from "./types";

export interface TreeContextValue {
  // Expand
  expandedKeysSet: ReadonlySet<TreeKey>;
  handleToggleExpand: (node: TreeDataNode, nativeEvent: any) => void;

  // Select
  selectable: boolean;
  multiple: boolean;
  selectedKeysSet: ReadonlySet<TreeKey>;
  handleToggleSelect: (node: TreeDataNode, nativeEvent: any) => void;

  // Check
  checkable: boolean;
  checkStrictly: boolean;
  checkedKeysSet: ReadonlySet<TreeKey>;
  halfCheckedKeysSet: ReadonlySet<TreeKey>;
  handleToggleCheck: (node: TreeDataNode) => void;

  // Appearance
  showLine: boolean;
  showLeafIcon: boolean;
  showIcon: boolean;
  blockNode: boolean;
  disabled: boolean;
  indent: number;

  // Rendering
  icon?: TreeProps["icon"];
  switcherIcon?: TreeProps["switcherIcon"];
  titleRender?: TreeProps["titleRender"];
  filterTreeNode?: TreeProps["filterTreeNode"];

  // Async loading
  loadData?: TreeProps["loadData"];
  loadedKeysSet: ReadonlySet<TreeKey>;
  loadingKeysSet: ReadonlySet<TreeKey>;

  // Lookup maps (stable between renders unless treeData changes)
  nodeMap: ReadonlyMap<TreeKey, TreeDataNode>;
}

export const TreeContext = React.createContext<TreeContextValue | null>(null);

export function useTreeContext(): TreeContextValue {
  const ctx = React.useContext(TreeContext);
  if (!ctx) throw new Error("useTreeContext must be used inside <Tree />");
  return ctx;
}
