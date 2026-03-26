/**
 * GridColumnMenu — column header context menu for Grid.
 *
 * Transparent Modal anchored below the ⋮ button.
 * Sections: Sort | Pin | Column (hide / move left / move right)
 */
import React, { memo, useCallback, useRef } from "react";
import { Dimensions, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import type { SortingState } from "@tanstack/react-table";
import { styles, textStyles, MENU_WIDTH } from "./styles";
import { MenuItem } from "./MenuItem";

const SCREEN_PADDING = 8;

export type GridColumnMenuState = {
  visible: boolean;
  field: string;
  headerName: string;
  x: number;
  y: number;
  pinned?: "left" | "right";
  sortable?: boolean;
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
};

type GridColumnMenuProps = {
  state: GridColumnMenuState;
  sorting: SortingState;
  onClose(): void;
  onSortAsc(field: string): void;
  onSortDesc(field: string): void;
  onSortClear(field: string): void;
  onPinLeft(field: string): void;
  onPinRight(field: string): void;
  onUnpin(field: string): void;
  onHide(field: string): void;
  onMoveLeft(field: string): void;
  onMoveRight(field: string): void;
  onAutosizeColumn(field: string): void;
  onAutosizeAllColumns(): void;
};

export const GridColumnMenu = memo(function GridColumnMenu({
  state,
  sorting,
  onClose,
  onSortAsc,
  onSortDesc,
  onSortClear,
  onPinLeft,
  onPinRight,
  onUnpin,
  onHide,
  onMoveLeft,
  onMoveRight,
  onAutosizeColumn,
  onAutosizeAllColumns,
}: GridColumnMenuProps) {
  const {
    visible,
    field,
    headerName,
    x,
    y,
    pinned,
    sortable,
    canMoveLeft,
    canMoveRight,
  } = state;

  const sortItem = sorting.find((s) => s.id === field);
  const currentSort = sortItem ? (sortItem.desc ? "desc" : "asc") : null;
  const isSorted = currentSort !== null;

  const { width: screenWidth } = Dimensions.get("window");
  const menuX = Math.min(x, screenWidth - MENU_WIDTH - SCREEN_PADDING);

  // Preserve last known position so the panel doesn't jump during close
  const frozenPos = useRef({ menuX, y });
  if (visible) frozenPos.current = { menuX, y };

  const close = useCallback(
    (action: () => void) => () => {
      action();
      onClose();
    },
    [onClose],
  );

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={StyleSheet.absoluteFill}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.panel, { left: frozenPos.current.menuX, top: frozenPos.current.y }]}>
        <View style={styles.header}>
          <Text style={textStyles.headerText} numberOfLines={1}>
            {headerName}
          </Text>
        </View>

        {sortable !== false && (
          <>
            <MenuItem
              icon="arrow-up-outline"
              label="Sort Ascending"
              active={currentSort === "asc"}
              onPress={close(() => onSortAsc(field))}
            />
            <MenuItem
              icon="arrow-down-outline"
              label="Sort Descending"
              active={currentSort === "desc"}
              onPress={close(() => onSortDesc(field))}
            />
            {isSorted && (
              <MenuItem
                icon="close-circle-outline"
                label="Clear Sort"
                onPress={close(() => onSortClear(field))}
              />
            )}
            <Divider />
          </>
        )}

        <MenuItem
          icon="pin-outline"
          label="Pin Left"
          active={pinned === "left"}
          onPress={close(() => onPinLeft(field))}
        />
        <MenuItem
          icon="pin-outline"
          label="Pin Right"
          active={pinned === "right"}
          onPress={close(() => onPinRight(field))}
        />
        {pinned && (
          <MenuItem
            icon="remove-circle-outline"
            label="No Pin"
            onPress={close(() => onUnpin(field))}
          />
        )}
        <Divider />

        <MenuItem
          icon="chevron-back-outline"
          label="Move Left"
          disabled={canMoveLeft === false}
          onPress={close(() => onMoveLeft(field))}
        />
        <MenuItem
          icon="chevron-forward-outline"
          label="Move Right"
          disabled={canMoveRight === false}
          onPress={close(() => onMoveRight(field))}
        />
        <Divider />
        <MenuItem
          icon="eye-off-outline"
          label="Hide Column"
          onPress={close(() => onHide(field))}
        />
        <Divider />
        <MenuItem
          icon="resize-outline"
          label="Autosize This Column"
          onPress={close(() => onAutosizeColumn(field))}
        />
        <MenuItem
          icon="scan-outline"
          label="Autosize All Columns"
          onPress={close(() => onAutosizeAllColumns())}
        />
        </View>
      </View>
    </Modal>
  );
});

const Divider = () => <View style={styles.divider} />;
