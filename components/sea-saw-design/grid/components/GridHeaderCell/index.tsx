/**
 * GridHeaderCell — single column header cell for Grid.
 *
 * Mirrors AG Grid's ag-header-cell structure:
 *   label (text + sort indicator) | ⋮ menu button | resize handle
 */
import React, { memo, useCallback, useRef, useState } from "react";
import { View, Text, Pressable, PanResponder, Platform } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { SortingState } from "@tanstack/react-table";

import { GRID_HEADER_HEIGHT, GRID_SELECTION_FIELD, QUARTZ } from "../../constants";
import { SortIndicator } from "../SortIndicator";
import { GridCheckboxHeaderCell } from "../GridCheckboxCell";
import type { ComputedColumn } from "../../types";
import { styles, textStyles } from "./styles";

type GridHeaderCellProps = {
  col: ComputedColumn;
  width: number;
  sorting: SortingState;
  onSort: (field: string) => void;
  onResize?: (field: string, width: number) => void;
  onOpenMenu?: (field: string, x: number, y: number) => void;
  checkboxHeaderState?: "none" | "some" | "all";
  onCheckboxHeaderPress?: () => void;
};

export const GridHeaderCell = memo(function GridHeaderCell({
  col,
  width,
  sorting,
  onSort,
  onResize,
  onOpenMenu,
  checkboxHeaderState = "none",
  onCheckboxHeaderPress,
}: GridHeaderCellProps) {
  const sortItem = sorting.find((s) => s.id === col.field);
  const direction = sortItem ? (sortItem.desc ? "desc" : "asc") : null;
  const priority = sorting.findIndex((s) => s.id === col.field) + 1;
  const hasMultiSort = sorting.length > 1;
  const isSorted = direction !== null;
  const isCheckboxCol = col.field === GRID_SELECTION_FIELD;

  const menuButtonRef = useRef<View>(null);
  const startWidthRef = useRef(width);
  const [isResizing, setIsResizing] = useState(false);
  const [isHoveringResize, setIsHoveringResize] = useState(false);

  // Refs keep PanResponder callbacks current without recreating the responder
  const colRef = useRef(col);
  const widthRef = useRef(width);
  const onResizeRef = useRef(onResize);
  colRef.current = col;
  widthRef.current = width;
  onResizeRef.current = onResize;

  const handlePress = useCallback(
    () => col.sortable && onSort(col.field),
    [col.sortable, col.field, onSort],
  );

  const handleMenuPress = useCallback(() => {
    if (!onOpenMenu || col.suppressMenu) return;
    menuButtonRef.current?.measureInWindow((x, y, _w, h) => {
      onOpenMenu(col.field, x, y + h + 2);
    });
  }, [col.field, col.suppressMenu, onOpenMenu]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => colRef.current.resizable !== false,
      onStartShouldSetPanResponderCapture: () => colRef.current.resizable !== false,
      onMoveShouldSetPanResponder: () => colRef.current.resizable !== false,
      onMoveShouldSetPanResponderCapture: () => colRef.current.resizable !== false,
      onPanResponderGrant: () => {
        startWidthRef.current = widthRef.current;
        setIsResizing(true);
      },
      onPanResponderMove: (_, gs) => {
        if (!onResizeRef.current) return;
        const c = colRef.current;
        const minW = c.minWidth ?? 30;
        const maxW = c.maxWidth ?? 2000;
        onResizeRef.current(c.field, Math.max(minW, Math.min(maxW, startWidthRef.current + gs.dx)));
      },
      onPanResponderRelease: () => setIsResizing(false),
      onPanResponderTerminate: () => setIsResizing(false),
    }),
  ).current;

  return (
    <View style={[styles.cell, { width, height: GRID_HEADER_HEIGHT }]}>
      {isCheckboxCol ? (
        <View style={styles.labelContainer}>
          <GridCheckboxHeaderCell
            state={checkboxHeaderState}
            onPress={onCheckboxHeaderPress ?? (() => {})}
          />
        </View>
      ) : (
        <Pressable
          style={({ pressed }) => [
            styles.labelContainer,
            pressed && col.sortable && styles.labelContainerActive,
          ]}
          onPress={handlePress}
          disabled={!col.sortable}
          accessible
          accessibilityRole="header"
        >
          <View style={styles.label}>
            <Text
              style={[
                textStyles.labelText,
                col.sortable && textStyles.labelTextSortable,
                isSorted && textStyles.labelTextSorted,
              ]}
              numberOfLines={1}
            >
              {col.headerName}
            </Text>
            {col.sortable && isSorted && direction ? (
              <SortIndicator direction={direction} priority={priority} hasMultiSort={hasMultiSort} />
            ) : col.sortable ? (
              <Ionicons name="chevron-expand-outline" size={11} color={QUARTZ.sortNone} />
            ) : null}
          </View>
        </Pressable>
      )}

      {!col.suppressMenu && !isCheckboxCol && onOpenMenu && (
        <View ref={menuButtonRef} style={styles.menuButtonWrapper}>
          <Pressable
            style={({ pressed }) => [styles.menuButton, pressed && styles.menuButtonPressed]}
            onPress={handleMenuPress}
            hitSlop={4}
          >
            <Ionicons name="ellipsis-vertical" size={14} color={QUARTZ.headerText} />
          </Pressable>
        </View>
      )}

      <View
        style={styles.resizeTouchTarget}
        {...(col.resizable !== false ? panResponder.panHandlers : {})}
        {...(Platform.OS === "web" && col.resizable !== false
          ? { onMouseEnter: () => setIsHoveringResize(true), onMouseLeave: () => setIsHoveringResize(false) }
          : {})}
      >
        <View style={[styles.resizeHandle, (isHoveringResize || isResizing) && styles.resizeHandleActive]} />
      </View>
    </View>
  );
});
