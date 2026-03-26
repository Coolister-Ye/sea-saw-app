import { StyleSheet } from "react-native";
import { QUARTZ } from "../../constants";

export const styles = StyleSheet.create({
  cell: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: QUARTZ.border,
    borderBottomWidth: 1,
    borderBottomColor: QUARTZ.border,
    backgroundColor: QUARTZ.headerBg,
  },
});

export const textStyles = StyleSheet.create({
  text: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6b7280",
    letterSpacing: 0.2,
  },
});
