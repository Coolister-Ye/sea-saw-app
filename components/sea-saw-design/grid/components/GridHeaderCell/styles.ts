import { Platform, StyleSheet } from "react-native";
import { QUARTZ } from "../../constants";

const RESIZE_TOUCH_WIDTH = 12;

export const styles = StyleSheet.create({
  cell: {
    flexDirection: "row",
    alignItems: "stretch",
    overflow: "hidden",
    backgroundColor: QUARTZ.headerBg,
  },
  labelContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    overflow: "hidden",
  },
  labelContainerActive: {
    backgroundColor: QUARTZ.headerActive,
  },
  label: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    overflow: "hidden",
  },
  menuButtonWrapper: {
    alignSelf: "stretch",
    justifyContent: "center",
  },
  menuButton: {
    width: 24,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  menuButtonPressed: {
    backgroundColor: QUARTZ.headerActive,
  },
  resizeTouchTarget: {
    width: RESIZE_TOUCH_WIDTH,
    alignSelf: "stretch",
    alignItems: "center",
    flexShrink: 0,
    ...Platform.select({ web: { cursor: "col-resize" } as any }),
  },
  resizeHandle: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: QUARTZ.border,
    marginVertical: 4,
  },
  resizeHandleActive: {
    backgroundColor: QUARTZ.resizeActive,
    width: 2,
  },
});

// Separate TextStyle sheet — avoids the ViewStyle | TextStyle | ImageStyle
// union that breaks StyleProp<TextStyle> when styles are mixed in one object.
export const textStyles = StyleSheet.create({
  labelText: {
    flexShrink: 1,
    fontSize: 13,
    fontWeight: "600",
    color: QUARTZ.headerText,
    letterSpacing: -0.1,
  },
  labelTextSortable: {
    color: QUARTZ.headerText,
  },
  labelTextSorted: {
    color: QUARTZ.accent,
  },
});
