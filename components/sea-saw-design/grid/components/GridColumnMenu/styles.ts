import { StyleSheet } from "react-native";

export const MENU_WIDTH = 200;

export const styles = StyleSheet.create({
  panel: {
    position: "absolute",
    width: MENU_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
    overflow: "hidden",
  },
  header: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f9fafb",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  itemPressed: { backgroundColor: "#f3f4f6" },
  itemDisabled: { opacity: 0.4 },
  itemIcon: { width: 18 },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#3b82f6",
  },
  divider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginVertical: 2,
  },
});

export const textStyles = StyleSheet.create({
  headerText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  itemLabel: {
    flex: 1,
    fontSize: 13,
    color: "#374151",
  },
  itemLabelActive: {
    color: "#3b82f6",
    fontWeight: "600",
  },
  itemLabelDisabled: { color: "#9ca3af" },
});
