import React, { memo } from "react";
import { View, Text } from "react-native";
import { GRID_GROUP_HEADER_HEIGHT } from "../../constants";
import { styles, textStyles } from "./styles";

type GridGroupHeaderCellProps = {
  headerName: string;
  width: number;
  isSpacing: boolean;
};

export const GridGroupHeaderCell = memo(function GridGroupHeaderCell({
  headerName,
  width,
  isSpacing,
}: GridGroupHeaderCellProps) {
  if (isSpacing) {
    return <View style={{ width, height: GRID_GROUP_HEADER_HEIGHT }} />;
  }
  return (
    <View style={[styles.cell, { width, height: GRID_GROUP_HEADER_HEIGHT }]}>
      <Text style={textStyles.text} numberOfLines={1}>
        {headerName}
      </Text>
    </View>
  );
});
