/** Grid-wide constants — shared across hooks and components. */

/** Field name for the auto-injected row-selection checkbox column. */
export const GRID_SELECTION_FIELD = "__selection__";

/** Data row height (px) — matches AG Grid Quartz rowHeight. */
export const GRID_ROW_HEIGHT = 30;

/** Column header row height (px) — matches AG Grid Quartz rowHeight. */
export const GRID_HEADER_HEIGHT = 30;

/** Column group header row height (px) — rendered above column headers. */
export const GRID_GROUP_HEADER_HEIGHT = 22;

/** AG Grid Quartz theme colour tokens. */
export const QUARTZ = {
  headerBg: "#f9fafb",
  headerText: "#374151",
  sortNone: "#9ca3af",
  accent: "#3b82f6",
  border: "#e5e7eb",
  headerActive: "#f3f4f6",
  resizeActive: "#3b82f6",
  rowBorder: "#f3f4f6",
  selectedRow: "#eff6ff",
  fg: "#1f2937",
} as const;
