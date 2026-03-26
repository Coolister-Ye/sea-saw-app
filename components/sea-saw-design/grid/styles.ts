/**
 * Grid layout styles — structural layout and pinned-column shadows only.
 * Quartz theme colours are applied inline or via NativeWind className.
 */
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  /* ── Quick filter ── */
  quickFilterBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    gap: 8,
  },
  searchIcon: {
    flexShrink: 0,
  },
  quickFilterInput: {
    flex: 1,
    fontSize: 13,
    color: "#1f2937",
    paddingVertical: 4,
  },

  /* ── Header ── */
  headerContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  groupHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  colHeaderRow: {
    flexDirection: "row",
  },
  pinnedLeftHeader: {
    backgroundColor: "#f9fafb",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 2,
  },
  scrollableHeaderOuter: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "#f9fafb",
  },
  pinnedRightHeader: {
    backgroundColor: "#f9fafb",
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 2,
  },

  /* ── Body ── */
  bodyContainer: {
    flex: 1,
    flexDirection: "row",
  },
  bodyOuter: {
    flex: 1,
  },
  bodyOuterContent: {
    flexGrow: 1,
  },
  pinnedLeftBody: {
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1,
    backgroundColor: "#fff",
  },
  pinnedRightBody: {
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1,
    backgroundColor: "#fff",
  },
});
