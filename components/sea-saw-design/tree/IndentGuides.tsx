import * as React from "react";
import { View } from "react-native";

interface IndentGuidesProps {
  depth: number;
  /** guideLines[i] = true → show vertical rule at indent level i */
  guideLines: boolean[];
  indent: number;
}

export function IndentGuides({ depth, guideLines, indent }: IndentGuidesProps) {
  if (depth === 0) return null;
  return (
    <>
      {Array.from({ length: depth }, (_, i) => (
        <View
          key={i}
          style={{
            width: indent,
            alignSelf: "stretch",
            borderLeftWidth: guideLines[i] ? 1 : 0,
            borderLeftColor: "#e0e0e0",
            borderStyle: "dashed",
          }}
        />
      ))}
    </>
  );
}
