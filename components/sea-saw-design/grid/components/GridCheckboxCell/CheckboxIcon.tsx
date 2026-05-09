import React, { memo } from "react";
import { Pressable } from "react-native";
import Svg, { Polyline, Line, Rect } from "react-native-svg";
import { styles, BOX_SIZE, SVG_VIEWBOX, CHECK_POINTS, LINE_MID_Y, LINE_X2 } from "./styles";
import { QUARTZ } from "../../constants";

type CheckboxIconProps = {
  checked: boolean;
  indeterminate?: boolean;
  onPress: () => void;
  hitSlop?: number;
};

export const CheckboxIcon = memo(function CheckboxIcon({
  checked,
  indeterminate = false,
  onPress,
  hitSlop = 8,
}: CheckboxIconProps) {
  const isActive = checked || indeterminate;

  return (
    <Pressable
      onPress={onPress}
      hitSlop={hitSlop}
      style={({ pressed }) => (pressed ? styles.boxPressed : undefined)}
    >
      <Svg width={BOX_SIZE} height={BOX_SIZE} viewBox={SVG_VIEWBOX}>
        <Rect
          x={0.75}
          y={0.75}
          width={BOX_SIZE - 1.5}
          height={BOX_SIZE - 1.5}
          rx={2}
          ry={2}
          fill={isActive ? QUARTZ.accent : "#ffffff"}
          stroke={isActive ? QUARTZ.accent : QUARTZ.sortNone}
          strokeWidth={1.5}
        />
        {indeterminate && (
          <Line
            x1={3.5}
            y1={LINE_MID_Y}
            x2={LINE_X2}
            y2={LINE_MID_Y}
            stroke="#ffffff"
            strokeWidth={2}
            strokeLinecap="round"
          />
        )}
        {!indeterminate && checked && (
          <Polyline
            points={CHECK_POINTS}
            fill="none"
            stroke="#ffffff"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </Svg>
    </Pressable>
  );
});
