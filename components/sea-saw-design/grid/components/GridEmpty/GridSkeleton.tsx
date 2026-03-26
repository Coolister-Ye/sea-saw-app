import React, { memo } from "react";
import { View } from "react-native";
import { GRID_ROW_HEIGHT } from "../../constants";

export const GridSkeletonRow = memo(function GridSkeletonRow({ index }: { index: number }) {
  return (
    <View
      className="flex-row border-b border-[#f3f4f6]"
      style={{ height: GRID_ROW_HEIGHT, backgroundColor: index % 2 === 0 ? "#fff" : "#fafafa" }}
    >
      <View className="flex-1 flex-row items-center px-3 gap-2">
        <View className="rounded" style={{ height: 10, width: "45%", backgroundColor: "#e5e7eb" }} />
        <View className="rounded" style={{ height: 10, width: "25%", backgroundColor: "#f3f4f6" }} />
      </View>
    </View>
  );
});

const SKELETON_ROWS = 8;

export function GridSkeleton() {
  return (
    <>
      {Array.from({ length: SKELETON_ROWS }, (_, i) => (
        <GridSkeletonRow key={i} index={i} />
      ))}
    </>
  );
}
