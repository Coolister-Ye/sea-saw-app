import { StyleSheet } from "react-native";

const BOX_SIZE = 16;

export const styles = StyleSheet.create({
  cellContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  box: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  boxChecked: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  boxIndeterminate: {
    backgroundColor: "#eff6ff",
    borderColor: "#3b82f6",
  },
  boxPressed: {
    opacity: 0.7,
  },
  checkmark: {
    width: 9,
    height: 9,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: "#fff",
    transform: [{ rotate: "45deg" }, { translateY: -1 }],
  },
  indeterminateLine: {
    width: 9,
    height: 2,
    borderRadius: 1,
    backgroundColor: "#3b82f6",
  },
});
