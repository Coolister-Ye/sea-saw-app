import type { TreeDataNode, TreeKey } from "./types";

/** Build a flat map of key → node for O(1) lookups */
export function buildNodeMap(
  nodes: TreeDataNode[],
  map = new Map<TreeKey, TreeDataNode>(),
): Map<TreeKey, TreeDataNode> {
  for (const node of nodes) {
    map.set(node.key, node);
    if (node.children?.length) buildNodeMap(node.children, map);
  }
  return map;
}

/** Build a map of key → parent key (null means root) */
export function buildParentMap(
  nodes: TreeDataNode[],
  parentKey: TreeKey | null = null,
  map = new Map<TreeKey, TreeKey | null>(),
): Map<TreeKey, TreeKey | null> {
  for (const node of nodes) {
    map.set(node.key, parentKey);
    if (node.children?.length) buildParentMap(node.children, node.key, map);
  }
  return map;
}

/** Collect all ancestor keys of `key` (excluding self) */
export function getAncestorKeys(
  key: TreeKey,
  parentMap: Map<TreeKey, TreeKey | null>,
): TreeKey[] {
  const ancestors: TreeKey[] = [];
  let cur = parentMap.get(key);
  while (cur != null) {
    ancestors.push(cur);
    cur = parentMap.get(cur);
  }
  return ancestors;
}

/**
 * Collect every key in the subtree rooted at `node` (inclusive),
 * skipping disabled/disableCheckbox nodes.
 */
export function getCheckableSubtreeKeys(node: TreeDataNode): TreeKey[] {
  const keys: TreeKey[] = [];
  const traverse = (n: TreeDataNode) => {
    if (n.disabled || n.disableCheckbox || n.checkable === false) return;
    keys.push(n.key);
    for (const child of n.children ?? []) traverse(child);
  };
  traverse(node);
  return keys;
}

/**
 * Given a set of "base" checked keys, compute the full {checked, halfChecked}
 * sets via bottom-up cascade.
 *
 * - A node is "checked"     when all its eligible children are checked.
 * - A node is "halfChecked" when only some eligible children are checked.
 */
export function computeFullCheckState(
  treeData: TreeDataNode[],
  baseChecked: ReadonlySet<TreeKey>,
): { checked: Set<TreeKey>; halfChecked: Set<TreeKey> } {
  const checked = new Set<TreeKey>(baseChecked);
  const halfChecked = new Set<TreeKey>();

  const process = (node: TreeDataNode): "checked" | "half" | "unchecked" => {
    const eligible = (node.children ?? []).filter(
      c => !c.disabled && !c.disableCheckbox && c.checkable !== false,
    );

    if (eligible.length === 0) {
      return checked.has(node.key) ? "checked" : "unchecked";
    }

    const states = eligible.map(process);
    const allChecked = states.every(s => s === "checked");
    const someChecked = states.some(s => s === "checked" || s === "half");

    if (allChecked) {
      checked.add(node.key);
      halfChecked.delete(node.key);
      return "checked";
    }
    if (someChecked) {
      checked.delete(node.key);
      halfChecked.add(node.key);
      return "half";
    }
    checked.delete(node.key);
    halfChecked.delete(node.key);
    return "unchecked";
  };

  for (const root of treeData) process(root);
  return { checked, halfChecked };
}
