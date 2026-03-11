import type { PresetColor } from "@/components/sea-saw-design/tag/types";
import type { ColDefinition } from "@/components/sea-saw-design/table/interface";

import type { AccountRole } from "./types";

export const COL_DEFINITIONS: Record<string, ColDefinition> = {
  created_at: { skip: true },
  updated_at: { skip: true },
  roles: { skip: true }, // Shown as badge in chip, not in table
};

export const ROLE_COLORS: Record<AccountRole, { bg: string; border: string; text: string }> = {
  CUSTOMER: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
  SUPPLIER: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700" },
  PROSPECT: { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-600" },
};

export const ROLE_TAG_COLORS: Record<AccountRole, PresetColor> = {
  CUSTOMER: "blue",
  SUPPLIER: "green",
  PROSPECT: "grey",
};
