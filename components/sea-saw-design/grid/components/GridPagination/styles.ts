import { StyleSheet, Platform } from "react-native";

const C = {
  fg: "#181d1f",
  secondary: "rgba(24,29,31,0.6)",
  border: "rgba(24,29,31,0.15)",
  accent: "#3b82f6",
  hoverBg: "rgba(59,130,246,0.1)",
  disabled: "rgba(24,29,31,0.38)",
} as const;

export const styles = StyleSheet.create({
  panel: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    columnGap: 20,
    rowGap: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    minHeight: 36,
    borderTopWidth: 1,
    borderTopColor: C.border,
    backgroundColor: "#f9fafb",
  },
  pageSizeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    height: 24,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 5,
    backgroundColor: "#fff",
    paddingHorizontal: 8,
  },
  triggerDisabled: { opacity: 0.5 },
  dropdownList: {
    position: "absolute",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 4,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.15, shadowRadius: 16 },
      android: { elevation: 8 },
      web: { boxShadow: "0 0 16px 0 rgba(0,0,0,0.15)" } as any,
    }),
  },
  listItem: { paddingHorizontal: 10, justifyContent: "center" },
  listItemActive: { backgroundColor: C.hoverBg },
  pageSummary: { flexDirection: "row", alignItems: "center", gap: 4 },
  navBtn: { width: 22, height: 22, alignItems: "center", justifyContent: "center" },
  pageDescription: { flexDirection: "row", alignItems: "center", marginHorizontal: 4 },
  pageInput: {
    fontSize: 12,
    fontWeight: "600",
    color: C.accent,
    minWidth: 28,
    textAlign: "center",
    padding: 0,
    borderBottomWidth: 1,
    borderBottomColor: C.accent,
    ...Platform.select({ web: { outlineStyle: "none" } as any }),
  },
});

export const textStyles = StyleSheet.create({
  pageSizeLabel: { fontSize: 12, color: C.secondary },
  triggerText: { fontSize: 12, color: C.fg, fontWeight: "500" },
  listItemText: { fontSize: 12, color: C.fg },
  listItemTextSelected: { fontWeight: "600", color: C.accent },
  rowSummary: { fontSize: 12 },
  summaryNum: { fontWeight: "500", color: C.fg },
  summaryWord: { color: C.secondary },
  pageWord: { fontSize: 12, color: C.secondary },
  pageNum: { fontSize: 12, fontWeight: "500", color: C.fg, minWidth: 14, textAlign: "center" },
});

export { C };
