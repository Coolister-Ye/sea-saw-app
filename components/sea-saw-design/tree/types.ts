import type React from "react";
import type { ViewStyle } from "react-native";

export type TreeKey = string | number;

export interface SwitcherIconProps {
  expanded: boolean;
  isLeaf: boolean;
  loading?: boolean;
}

/**
 * Data shape for each node in the tree.
 * Mirrors antd's TreeDataNode interface.
 */
export interface TreeDataNode {
  /** Unique identifier — required */
  key: TreeKey;
  /** Node label (string or ReactNode) */
  title?: React.ReactNode;
  /** Child nodes */
  children?: TreeDataNode[];
  /** Override tree-level `checkable` for this node */
  checkable?: boolean;
  /** Disable the checkbox only (node stays selectable) */
  disableCheckbox?: boolean;
  /** Disable the node entirely (no click, no check) */
  disabled?: boolean;
  /** Per-node icon (overrides tree-level `icon`) */
  icon?: React.ReactNode | ((node: TreeDataNode) => React.ReactNode);
  /** Force leaf treatment — hides expand arrow even if children present */
  isLeaf?: boolean;
  /** Override tree-level `selectable` for this node */
  selectable?: boolean;
  /** Per-node custom expand/collapse icon */
  switcherIcon?:
    | React.ReactNode
    | ((props: SwitcherIconProps) => React.ReactNode);
  /** Extra styles for this node's row container */
  style?: ViewStyle;
  /** Allow arbitrary extra fields consumed by titleRender */
  [key: string]: any;
}

/* ── Callback info payloads ─────────────────────────────────────────────── */

export interface ExpandInfo {
  node: TreeDataNode;
  expanded: boolean;
  nativeEvent: any;
}

export interface SelectInfo {
  node: TreeDataNode;
  selected: boolean;
  selectedNodes: TreeDataNode[];
  nativeEvent: any;
}

export interface CheckInfo {
  node: TreeDataNode;
  checked: boolean;
  checkedNodes: TreeDataNode[];
  halfCheckedKeys: TreeKey[];
}

export interface LoadInfo {
  event: "load";
  node: TreeDataNode;
}

/* ── Main props interface ───────────────────────────────────────────────── */

export interface TreeProps {
  // ── Data ───────────────────────────────────────────────────────────────
  /** Array of root-level tree nodes */
  treeData?: TreeDataNode[];

  // ── Expand / Collapse ──────────────────────────────────────────────────
  /** Expand all nodes on mount (uncontrolled) */
  defaultExpandAll?: boolean;
  /** Initially expanded keys (uncontrolled) */
  defaultExpandedKeys?: TreeKey[];
  /** Controlled expanded keys — provide `onExpand` to update */
  expandedKeys?: TreeKey[];
  /**
   * When true (default), expanding a child automatically expands all its
   * ancestors. Only relevant in uncontrolled mode.
   */
  autoExpandParent?: boolean;
  /** Called when a node is expanded or collapsed */
  onExpand?: (
    expandedKeys: TreeKey[],
    info: ExpandInfo,
  ) => void;

  // ── Selection ──────────────────────────────────────────────────────────
  /** Allow row selection (default: true) */
  selectable?: boolean;
  /** Allow multiple rows to be selected simultaneously */
  multiple?: boolean;
  /** Initially selected keys (uncontrolled) */
  defaultSelectedKeys?: TreeKey[];
  /** Controlled selected keys — provide `onSelect` to update */
  selectedKeys?: TreeKey[];
  /** Called when a node is selected or deselected */
  onSelect?: (selectedKeys: TreeKey[], info: SelectInfo) => void;

  // ── Checkboxes ─────────────────────────────────────────────────────────
  /** Render checkboxes beside each node */
  checkable?: boolean;
  /**
   * When true, checking a parent does NOT cascade to children.
   * Default: false (cascade enabled).
   */
  checkStrictly?: boolean;
  /** Initially checked keys (uncontrolled) */
  defaultCheckedKeys?: TreeKey[];
  /**
   * Controlled checked keys.
   * Can be a plain array (halfChecked is computed) or an explicit
   * `{ checked, halfChecked }` object (used with checkStrictly).
   */
  checkedKeys?:
    | TreeKey[]
    | { checked: TreeKey[]; halfChecked: TreeKey[] };
  /** Called when a checkbox is toggled */
  onCheck?: (
    checked: TreeKey[] | { checked: TreeKey[]; halfChecked: TreeKey[] },
    info: CheckInfo,
  ) => void;

  // ── Appearance ─────────────────────────────────────────────────────────
  /** Draw connecting lines between nodes */
  showLine?: boolean | { showLeafIcon?: boolean };
  /** Show icons beside node titles */
  showIcon?: boolean;
  /** Highlight the full row width on selection (not just the title) */
  blockNode?: boolean;
  /** Disable the entire tree (all interactions) */
  disabled?: boolean;
  /** Horizontal indent per level in logical pixels (default: 24) */
  indent?: number;

  // ── Icon / rendering overrides ─────────────────────────────────────────
  /** Default icon for all nodes (overridden per-node by `node.icon`) */
  icon?: React.ReactNode | ((node: TreeDataNode) => React.ReactNode);
  /**
   * Custom expand/collapse arrow.
   * Receives `{ expanded, isLeaf, loading }`.
   */
  switcherIcon?:
    | React.ReactNode
    | ((props: SwitcherIconProps) => React.ReactNode);
  /** Custom renderer for each node's title area */
  titleRender?: (node: TreeDataNode) => React.ReactNode;

  // ── Async loading ──────────────────────────────────────────────────────
  /**
   * Called when an unloaded node is expanded.
   * Resolve the returned Promise after you've populated `node.children`.
   */
  loadData?: (node: TreeDataNode) => Promise<void>;
  /** Controlled set of already-loaded node keys */
  loadedKeys?: TreeKey[];
  /** Called after async loading completes for a node */
  onLoad?: (loadedKeys: TreeKey[], info: LoadInfo) => void;

  // ── Filter / highlight ─────────────────────────────────────────────────
  /**
   * Highlight nodes where this function returns true.
   * All nodes remain visible; matches are visually emphasized.
   */
  filterTreeNode?: (node: TreeDataNode) => boolean;

  // ── Style ──────────────────────────────────────────────────────────────
  className?: string;
  style?: ViewStyle;
}
