import { themeQuartz } from "ag-grid-community";

/* ═══════════════════════════════════════════════════════════════════════════
   SHARED CONFIGURATION
   ═══════════════════════════════════════════════════════════════════════════ */

const FONT_FAMILY =
  'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

/** Shared layout and typography settings */
const baseParams = {
  fontSize: 13,
  fontFamily: FONT_FAMILY,
  spacing: 6,
  cellHorizontalPadding: 12,
  rowHeight: 40,
  headerHeight: 35,
  wrapperBorderRadius: 0,
  borderRadius: 6,
};

/* ═══════════════════════════════════════════════════════════════════════════
   LIGHT THEME
   ═══════════════════════════════════════════════════════════════════════════ */

export const theme = themeQuartz.withParams({
  ...baseParams,

  // Borders
  columnBorder: { style: "solid", width: 1, color: "#e5e7eb" },
  rowBorder: { style: "solid", width: 1, color: "#f3f4f6" },
  sidePanelBorder: { style: "solid", width: 1, color: "#e5e7eb" },

  // Colors
  backgroundColor: "#ffffff",
  foregroundColor: "#1f2937",
  headerBackgroundColor: "#f9fafb",
  headerTextColor: "#374151",
  oddRowBackgroundColor: "#ffffff",
  rowHoverColor: "#f3f4f6",
  selectedRowBackgroundColor: "#eff6ff",
  rangeSelectionBackgroundColor: "#dbeafe",
  chromeBackgroundColor: "#f9fafb",

  // Accent
  accentColor: "#6366f1",
  inputFocusBorder: "#6366f1",
});

/* ═══════════════════════════════════════════════════════════════════════════
   DARK THEME
   ═══════════════════════════════════════════════════════════════════════════ */

export const themeDark = themeQuartz.withParams({
  ...baseParams,

  // Borders
  columnBorder: { style: "solid", width: 1, color: "#374151" },
  rowBorder: { style: "solid", width: 1, color: "#1f2937" },
  sidePanelBorder: { style: "solid", width: 1, color: "#374151" },

  // Colors
  backgroundColor: "#111827",
  foregroundColor: "#f9fafb",
  headerBackgroundColor: "#1f2937",
  headerTextColor: "#e5e7eb",
  oddRowBackgroundColor: "#111827",
  rowHoverColor: "#1f2937",
  selectedRowBackgroundColor: "#1e3a5f",
  rangeSelectionBackgroundColor: "#1e40af",
  chromeBackgroundColor: "#1f2937",

  // Accent
  accentColor: "#818cf8",
  inputFocusBorder: "#818cf8",
});
