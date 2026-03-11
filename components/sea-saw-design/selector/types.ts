import type { ColDefinition } from "@/components/sea-saw-design/table/interface";
import type { FormDef } from "@/hooks/useFormDefs";

export interface EntityItem {
  id: string | number;
  [key: string]: any;
}

export interface EntitySelectorProps<T extends EntityItem> {
  def?: FormDef;
  value?: T | T[] | null;
  onChange?: (v: T | T[] | null) => void;
  multiple?: boolean;

  /** API endpoint key (maps to Constants.ts) */
  contentType: string;

  /** Field to display in the trigger input (e.g., "company_name") */
  displayField: string;

  /** Custom column definitions to override auto-generated columns */
  colDefinitions?: Record<string, ColDefinition>;

  /** Column display order (fields not listed will be appended at the end) */
  columnOrder?: string[];

  searchPlaceholder?: string;
  title?: string;

  /** Custom response mapper */
  mapResponseToItems?: (response: any) => T[];

  /** Custom chip renderer for selected items */
  renderSelectedChip?: (item: T, onRemove: () => void) => React.ReactNode;

  /** Additional query parameters to send with API requests */
  queryParams?: Record<string, any>;
}
