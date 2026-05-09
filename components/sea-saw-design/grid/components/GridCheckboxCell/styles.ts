import { StyleSheet } from "react-native";

export const BOX_SIZE = 16;
export const SVG_VIEWBOX = "0 0 16 16";
export const CHECK_POINTS = "3.5,8 7.5,12 13,4";
export const LINE_MID_Y = 8;
export const LINE_X2 = 12.5;

export const styles = StyleSheet.create({
  cellContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  boxPressed: {
    opacity: 0.7,
  },
});
