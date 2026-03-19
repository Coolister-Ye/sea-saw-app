/**
 * PaginationBar — matches AG Grid's Quartz-theme pagination panel.
 *
 * Layout (right-aligned, mirrors ag-paging-panel):
 *   [Page Size: [50 ▼]] · [X to Y of Z] · [⏮ ◀  Page X of Y  ▶ ⏭]
 *
 * PageSizeSelect replicates AgSelect:
 *   - Trigger: bordered pill (border-radius:5, height:24) + chevron icon
 *   - Dropdown: shadow popup (Modal) with 24px-high hover items
 */

import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  StyleSheet,
  Platform,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import i18n from "@/locale/i18n";
import { PAGE_SIZE_OPTIONS } from "../hooks/useTableData";

/* ─── Quartz theme token values ─────────────────────────────────────────── */
const C = {
  fg: "#181d1f",
  secondary: "rgba(24,29,31,0.6)",
  border: "rgba(24,29,31,0.15)",
  accent: "#2196f3",
  hoverBg: "rgba(33,150,243,0.12)",
  bg: "#fff",
  shadow: "rgba(0,0,0,0.15)",
  disabled: "rgba(24,29,31,0.38)",
} as const;

/* ══════════════════════════════════════════════════════════════════════════
   PageSizeSelect — mirrors ag-select / ag-picker-field-wrapper
   ══════════════════════════════════════════════════════════════════════════ */

type PageSizeSelectProps = {
  value: number;
  options: readonly number[];
  onChange: (v: number) => void;
  disabled?: boolean;
};

function PageSizeSelect({ value, options, onChange, disabled }: PageSizeSelectProps) {
  const [open, setOpen] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const triggerRef = useRef<View>(null);
  const [dropdownPos, setDropdownPos] = useState({ x: 0, y: 0, width: 0 });

  const openDropdown = useCallback(() => {
    if (disabled) return;
    triggerRef.current?.measure((_fx, _fy, w, _h, px, py) => {
      // Position dropdown above the trigger (AG Grid style — opens upward in footer)
      setDropdownPos({ x: px, y: py, width: w });
      setOpen(true);
    });
  }, [disabled]);

  const selectItem = useCallback(
    (v: number) => {
      setOpen(false);
      if (v !== value) onChange(v);
    },
    [value, onChange],
  );

  const ITEM_H = 28; // --ag-list-item-height
  const listHeight = options.length * ITEM_H;

  return (
    <>
      {/* ── Trigger button: ag-picker-field-wrapper ── */}
      <TouchableOpacity
        ref={triggerRef as any}
        onPress={openDropdown}
        activeOpacity={0.7}
        disabled={disabled}
        style={[styles.trigger, disabled && styles.triggerDisabled]}
      >
        <Text style={styles.triggerText}>{value}</Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={11}
          color={disabled ? C.disabled : C.secondary}
          style={{ marginLeft: 3 }}
        />
      </TouchableOpacity>

      {/* ── Dropdown list: ag-select-list (in Modal so it floats above) ── */}
      <Modal
        visible={open}
        transparent
        animationType="none"
        onRequestClose={() => setOpen(false)}
        statusBarTranslucent
      >
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={StyleSheet.absoluteFill}>
            <View
              style={[
                styles.dropdownList,
                {
                  left: dropdownPos.x,
                  // open upward so list doesn't go below the bar
                  top: dropdownPos.y - listHeight - 4,
                  minWidth: dropdownPos.width,
                },
              ]}
            >
              {options.map((opt, idx) => {
                const isSelected = opt === value;
                const isHovered = hoveredIdx === idx;
                return (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => selectItem(opt)}
                    onPressIn={() => setHoveredIdx(idx)}
                    onPressOut={() => setHoveredIdx(null)}
                    activeOpacity={0.8}
                    style={[
                      styles.listItem,
                      { height: ITEM_H },
                      (isHovered || isSelected) && styles.listItemActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.listItemText,
                        isSelected && styles.listItemTextSelected,
                      ]}
                    >
                      {opt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   PaginationBar
   ══════════════════════════════════════════════════════════════════════════ */

type PaginationBarProps = {
  page: number;
  pageSize: number;
  total: number;
  loading: boolean;
  onFirst: () => void;
  onPrev: () => void;
  onNext: () => void;
  onLast: () => void;
  onPageSizeChange: (size: number) => void;
  onGoToPage: (page: number) => void;
};

function fmt(n: number) {
  return n.toLocaleString();
}

export function PaginationBar({
  page,
  pageSize,
  total,
  loading,
  onFirst,
  onPrev,
  onNext,
  onLast,
  onPageSizeChange,
  onGoToPage,
}: PaginationBarProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const isFirst = page <= 1;
  const isLast = page >= totalPages;

  /* ── jump-to-page ── */
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState("");

  const startEdit = useCallback(() => {
    if (loading) return;
    setInputVal(String(page));
    setEditing(true);
  }, [loading, page]);

  const commitEdit = useCallback(() => {
    setEditing(false);
    const n = parseInt(inputVal, 10);
    if (!isNaN(n) && n >= 1 && n <= totalPages && n !== page) {
      onGoToPage(n);
    }
  }, [inputVal, totalPages, page, onGoToPage]);

  return (
    <View style={styles.panel}>

      {/* ── "Page Size: [50▼]" ──────────────────────────────────────────── */}
      <View style={styles.pageSizeRow}>
        <Text style={styles.pageSizeLabel}>{i18n.t("Page Size")}:</Text>
        <PageSizeSelect
          value={pageSize}
          options={PAGE_SIZE_OPTIONS}
          onChange={onPageSizeChange}
          disabled={loading}
        />
      </View>

      {/* ── "X to Y of Z" ───────────────────────────────────────────────── */}
      <Text style={styles.rowSummary}>
        {total === 0 ? (
          <Text style={{ color: C.secondary }}>{i18n.t("No rows")}</Text>
        ) : (
          <>
            <Text style={styles.summaryNum}>{fmt(start)}</Text>
            <Text style={styles.summaryWord}> {i18n.t("to")} </Text>
            <Text style={styles.summaryNum}>{fmt(end)}</Text>
            <Text style={styles.summaryWord}> {i18n.t("of")} </Text>
            <Text style={styles.summaryNum}>{fmt(total)}</Text>
          </>
        )}
      </Text>

      {/* ── [⏮][◀] Page X of Y [▶][⏭] ─────────────────────────────────── */}
      <View style={[styles.pageSummary, loading && { opacity: 0.5 }]}>
        <NavBtn icon="play-skip-back" onPress={onFirst} disabled={isFirst || loading} />
        <NavBtn icon="chevron-back" onPress={onPrev} disabled={isFirst || loading} />

        <View style={styles.pageDescription}>
          <Text style={styles.pageWord}>{i18n.t("Page")} </Text>

          {editing ? (
            <TextInput
              style={styles.pageInput}
              value={inputVal}
              onChangeText={(t) => setInputVal(t.replace(/[^0-9]/g, ""))}
              onBlur={commitEdit}
              onSubmitEditing={commitEdit}
              keyboardType="number-pad"
              returnKeyType="go"
              selectTextOnFocus
              autoFocus
              maxLength={6}
            />
          ) : (
            <TouchableOpacity onPress={startEdit} activeOpacity={0.6}>
              <Text style={styles.pageNum}>{fmt(page)}</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.pageWord}> {i18n.t("of")} </Text>
          <Text style={styles.pageNum}>{fmt(totalPages)}</Text>
        </View>

        <NavBtn icon="chevron-forward" onPress={onNext} disabled={isLast || loading} />
        <NavBtn icon="play-skip-forward" onPress={onLast} disabled={isLast || loading} />
      </View>
    </View>
  );
}

/* ─── icon-only nav button ──────────────────────────────────────────────── */
function NavBtn({
  icon,
  onPress,
  disabled,
}: {
  icon: "play-skip-back" | "chevron-back" | "chevron-forward" | "play-skip-forward";
  onPress: () => void;
  disabled: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.5}
      style={[styles.navBtn, disabled && { opacity: 0.5 }]}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Ionicons name={icon} size={15} color={disabled ? C.disabled : C.secondary} />
    </TouchableOpacity>
  );
}

/* ─── styles ─────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  /* ag-paging-panel */
  panel: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    columnGap: 20,
    rowGap: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    minHeight: 36,
    borderTopWidth: 1,
    borderTopColor: C.border,
    backgroundColor: C.bg,
  },

  /* ag-paging-page-size */
  pageSizeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pageSizeLabel: {
    fontSize: 12,
    color: C.secondary,
  },

  /* ag-picker-field-wrapper */
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    height: 24,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 5,
    backgroundColor: C.bg,
    paddingHorizontal: 8,
  },
  triggerDisabled: {
    opacity: 0.5,
  },
  triggerText: {
    fontSize: 12,
    color: C.fg,
    fontWeight: "500",
  },

  /* ag-select-list */
  dropdownList: {
    position: "absolute",
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 4,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: { elevation: 8 },
      web: { boxShadow: `0 0 16px 0 ${C.shadow}` } as any,
    }),
  },

  /* ag-select-list-item */
  listItem: {
    paddingHorizontal: 10,
    justifyContent: "center",
  },
  listItemActive: {
    backgroundColor: C.hoverBg,
  },
  listItemText: {
    fontSize: 12,
    color: C.fg,
  },
  listItemTextSelected: {
    fontWeight: "600",
    color: C.accent,
  },

  /* ag-paging-row-summary-panel */
  rowSummary: {
    fontSize: 12,
  },
  summaryNum: {
    fontWeight: "500",
    color: C.fg,
  },
  summaryWord: {
    color: C.secondary,
  },

  /* ag-paging-page-summary-panel */
  pageSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  navBtn: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },

  /* ag-paging-description */
  pageDescription: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 4,
  },
  pageWord: {
    fontSize: 12,
    color: C.secondary,
  },
  /* ag-paging-number */
  pageNum: {
    fontSize: 12,
    fontWeight: "500",
    color: C.fg,
    minWidth: 14,
    textAlign: "center",
  },
  pageInput: {
    fontSize: 12,
    fontWeight: "600",
    color: C.accent,
    minWidth: 28,
    textAlign: "center",
    padding: 0,
    borderBottomWidth: 1,
    borderBottomColor: C.accent,
    ...Platform.select({ web: { outlineStyle: "none" } as any }),
  },
});
