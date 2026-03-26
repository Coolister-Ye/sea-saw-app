import React, { memo } from "react";
import { View } from "react-native";
import { CheckboxIcon } from "./CheckboxIcon";
import { styles } from "./styles";

type GridCheckboxHeaderCellProps = {
  state: "none" | "some" | "all";
  onPress: () => void;
};

export const GridCheckboxHeaderCell = memo(function GridCheckboxHeaderCell({
  state,
  onPress,
}: GridCheckboxHeaderCellProps) {
  return (
    <View style={styles.cellContainer}>
      <CheckboxIcon
        checked={state === "all"}
        indeterminate={state === "some"}
        onPress={onPress}
      />
    </View>
  );
});
