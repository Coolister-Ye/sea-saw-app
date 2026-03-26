import React, { useCallback } from "react";
import { View } from "react-native";
import type { CellRendererProps } from "../../types";
import type { GridRowSelectionContext } from "./types";
import { CheckboxIcon } from "./CheckboxIcon";
import { styles } from "./styles";

export function GridCheckboxCell({ data, context }: CellRendererProps) {
  const sel = context?.__rowSelection as GridRowSelectionContext | undefined;
  if (!sel) return null;

  const rowId = String(data?.pk ?? data?.id ?? "");

  const handlePress = useCallback(
    () => sel.toggleRow(rowId),
    [sel, rowId],
  );

  return (
    <View style={styles.cellContainer}>
      <CheckboxIcon checked={sel.isRowSelected(rowId)} onPress={handlePress} />
    </View>
  );
}
