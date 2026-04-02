import type { TreeDataNode } from "@/components/sea-saw-design/tree";

export interface RoleData {
  id: number;
  role_name: string;
  role_type: string;
  parent: number | null;
  is_peer_visible: boolean;
  description: string | null;
}

export interface RoleTreeNode extends TreeDataNode {
  role: RoleData;
  children?: RoleTreeNode[];
}

interface FlatTreeNode extends RoleData {
  children: FlatTreeNode[];
}

/* ── Constants ── */

export const ROLE_TYPE_COLOR: Record<string, string> = {
  ADMIN: "purple",
  SALE: "blue",
  PRODUCTION: "orange",
  WAREHOUSE: "green",
  FINANCE: "gold",
  UNKNOWN: "default",
};

export const ROLE_TYPE_LABEL: Record<string, string> = {
  ADMIN: "Admin",
  SALE: "Sales",
  PRODUCTION: "Production",
  WAREHOUSE: "Warehouse",
  FINANCE: "Finance",
  UNKNOWN: "Unknown",
};

export const ROLE_TYPE_OPTIONS = Object.entries(ROLE_TYPE_LABEL).map(
  ([value, label]) => ({ value, label }),
);

/* ── Tree builder utils ── */

function buildFlatTree(roles: RoleData[]): FlatTreeNode[] {
  const map = new Map<number, FlatTreeNode>();
  roles.forEach(r => map.set(r.id, { ...r, children: [] }));

  const roots: FlatTreeNode[] = [];
  map.forEach(node => {
    if (node.parent !== null && map.has(node.parent)) {
      map.get(node.parent)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortChildren = (nodes: FlatTreeNode[]) => {
    nodes.sort((a, b) => a.id - b.id);
    nodes.forEach(n => sortChildren(n.children));
  };
  sortChildren(roots);

  return roots;
}

function flatToRoleTreeNode(nodes: FlatTreeNode[]): RoleTreeNode[] {
  return nodes.map(n => ({
    key: String(n.id),
    role: n,
    children: n.children.length > 0 ? flatToRoleTreeNode(n.children) : undefined,
  }));
}

export function toTreeData(roles: RoleData[]): RoleTreeNode[] {
  return flatToRoleTreeNode(buildFlatTree(roles));
}
