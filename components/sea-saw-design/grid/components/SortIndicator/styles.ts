import { StyleSheet } from "react-native";
import { QUARTZ } from "../../constants";

export const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
    gap: 1,
  },
});

export const textStyles = StyleSheet.create({
  priority: {
    fontSize: 9,
    fontWeight: "700",
    color: QUARTZ.accent,
    lineHeight: 11,
  },
});
