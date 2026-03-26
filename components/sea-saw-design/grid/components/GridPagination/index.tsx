/**
 * GridPagination — pagination bar for Grid.
 *
 * Layout: [Page Size: [50▼]] · [X to Y of Z] · [⏮ ◀ Page X of Y ▶ ⏭]
 */
import React, { useState, useCallback, memo } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import i18n from "@/locale/i18n";
import type { PaginationState } from "@tanstack/react-table";
import { styles, textStyles, C } from "./styles";
import { NavBtn } from "./NavBtn";
import { PageSizeSelect } from "./PageSizeSelect";

export { PAGE_SIZE_OPTIONS } from "./constants";

type GridPaginationProps = {
  pagination: PaginationState;
  total: number;
  loading: boolean;
  onPaginationChange(updater: PaginationState | ((old: PaginationState) => PaginationState)): void;
};

function fmt(n: number) {
  return n.toLocaleString();
}

export const GridPagination = memo(function GridPagination({
  pagination,
  total,
  loading,
  onPaginationChange,
}: GridPaginationProps) {
  const { pageIndex, pageSize } = pagination;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = pageIndex + 1;
  const start = total === 0 ? 0 : pageIndex * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const isFirst = pageIndex <= 0;
  const isLast = page >= totalPages;

  const goToPage = useCallback(
    (p: number) => onPaginationChange({ pageIndex: p - 1, pageSize }),
    [onPaginationChange, pageSize],
  );

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
    if (!isNaN(n) && n >= 1 && n <= totalPages && n !== page) goToPage(n);
  }, [inputVal, totalPages, page, goToPage]);

  return (
    <View style={styles.panel}>
      <View style={styles.pageSizeRow}>
        <Text style={textStyles.pageSizeLabel}>{i18n.t("Page Size")}:</Text>
        <PageSizeSelect
          value={pageSize}
          onChange={(ps) => onPaginationChange({ pageIndex: 0, pageSize: ps })}
          disabled={loading}
        />
      </View>

      <Text style={textStyles.rowSummary}>
        {total === 0 ? (
          <Text style={{ color: C.secondary }}>{i18n.t("No rows")}</Text>
        ) : (
          <>
            <Text style={textStyles.summaryNum}>{fmt(start)}</Text>
            <Text style={textStyles.summaryWord}> {i18n.t("to")} </Text>
            <Text style={textStyles.summaryNum}>{fmt(end)}</Text>
            <Text style={textStyles.summaryWord}> {i18n.t("of")} </Text>
            <Text style={textStyles.summaryNum}>{fmt(total)}</Text>
          </>
        )}
      </Text>

      <View style={[styles.pageSummary, loading && { opacity: 0.5 }]}>
        <NavBtn icon="play-skip-back" onPress={() => goToPage(1)} disabled={isFirst || loading} />
        <NavBtn icon="chevron-back" onPress={() => goToPage(page - 1)} disabled={isFirst || loading} />
        <View style={styles.pageDescription}>
          <Text style={textStyles.pageWord}>{i18n.t("Page")} </Text>
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
              <Text style={textStyles.pageNum}>{fmt(page)}</Text>
            </TouchableOpacity>
          )}
          <Text style={textStyles.pageWord}> {i18n.t("of")} </Text>
          <Text style={textStyles.pageNum}>{fmt(totalPages)}</Text>
        </View>
        <NavBtn icon="chevron-forward" onPress={() => goToPage(page + 1)} disabled={isLast || loading} />
        <NavBtn icon="play-skip-forward" onPress={() => goToPage(totalPages)} disabled={isLast || loading} />
      </View>
    </View>
  );
});
