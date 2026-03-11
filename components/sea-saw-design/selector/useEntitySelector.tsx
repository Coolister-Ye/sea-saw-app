import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { View, Pressable } from "react-native";
import type { ColDef, GridApi } from "ag-grid-community";
import { XMarkIcon } from "react-native-heroicons/outline";

import { Text } from "@/components/sea-saw-design/text";
import {
  getAgFilterType,
  getFilterParams,
  getCellDataType,
  getValueFormatter,
} from "@/components/sea-saw-design/table/utils";
import type { HeaderMetaProps } from "@/components/sea-saw-design/table/interface";
import useDataService from "@/hooks/useDataService";
import { devError } from "@/utils/logger";
import i18n from "@/locale/i18n";

import type { EntityItem, EntitySelectorProps } from "./types";
import { DEFAULT_COL_WIDTH, normalizeHeaderMeta, normalizeValue } from "./utils";

export function useEntitySelector<T extends EntityItem>({
  def,
  value,
  onChange,
  multiple = false,
  contentType,
  colDefinitions,
  columnOrder,
  displayField,
  searchPlaceholder,
  title,
  mapResponseToItems,
  queryParams,
}: EntitySelectorProps<T>) {
  const { getViewSet } = useDataService();
  const viewSet = useMemo(
    () => getViewSet(contentType),
    [getViewSet, contentType],
  );

  const readOnly = def?.read_only === true;

  // ── State ──────────────────────────────────────────────────────────────────
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<T[]>([]);
  const [selected, setSelected] = useState<T[]>(() => normalizeValue(value));
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const gridApiRef = useRef<GridApi | null>(null);

  // ── Column definitions ─────────────────────────────────────────────────────
  // useMemo 替代 useCallback + useState + useEffect 三步
  const columnDefs = useMemo((): ColDef[] => {
    const meta = normalizeHeaderMeta(def);
    const processedFields = new Set<string>();

    const metaColumns = Object.entries(meta)
      .filter(([key]) => !colDefinitions?.[key]?.skip)
      .map(([field, fieldMeta]: [string, HeaderMetaProps]) => {
        processedFields.add(field);
        const customDef = colDefinitions?.[field] ?? {};
        return {
          field,
          headerName: fieldMeta.label,
          filter: getAgFilterType(fieldMeta.type, fieldMeta.operations ?? []),
          filterParams: getFilterParams(fieldMeta.operations ?? []),
          cellDataType: getCellDataType(fieldMeta.type),
          valueFormatter: getValueFormatter(
            fieldMeta.type,
            fieldMeta.display_fields,
          ),
          sortable: true,
          resizable: true,
          minWidth: DEFAULT_COL_WIDTH,
          ...customDef,
        } as ColDef;
      });

    const extraColumns = Object.entries(colDefinitions ?? {})
      .filter(([key, def]) => !processedFields.has(key) && !def?.skip)
      .map(([field, def]) => ({
        field,
        minWidth: DEFAULT_COL_WIDTH,
        sortable: true,
        resizable: true,
        ...def,
      }));

    const allColumns = [...metaColumns, ...extraColumns];

    if (columnOrder?.length) {
      const orderMap = new Map(columnOrder.map((f, i) => [f, i]));
      allColumns.sort((a, b) => {
        const aIdx = orderMap.get(a.field as string) ?? Infinity;
        const bIdx = orderMap.get(b.field as string) ?? Infinity;
        return aIdx - bIdx;
      });
    }

    return allColumns;
  }, [def, colDefinitions, columnOrder]);

  // ── Sync external value → selected ────────────────────────────────────────
  useEffect(() => {
    setSelected(normalizeValue(value));
  }, [value]);

  // ── Data fetching ──────────────────────────────────────────────────────────
  const fetchData = useCallback(
    async (keyword = "") => {
      setLoading(true);
      try {
        const res = await viewSet.list({
          params: { page: 1, page_size: 20, search: keyword, ...queryParams },
        });
        const results = mapResponseToItems
          ? mapResponseToItems(res)
          : res.results?.map((item: any) => ({
              ...item,
              id: item.pk ?? item.id,
            })) ?? [];
        setOptions(results);
      } catch (error) {
        devError(`Failed to fetch ${contentType}:`, error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    },
    [viewSet, contentType, mapResponseToItems, queryParams],
  );

  // ── Search debounce ────────────────────────────────────────────────────────
  // 关闭时重置搜索状态
  useEffect(() => {
    if (!isOpen) {
      setSearchText("");
      setDebouncedSearch("");
    }
  }, [isOpen]);

  // 空值立即生效，有内容延迟 400ms
  useEffect(() => {
    if (!isOpen) return;
    if (searchText === "") {
      setDebouncedSearch("");
      return;
    }
    const timer = setTimeout(() => setDebouncedSearch(searchText), 400);
    return () => clearTimeout(timer);
  }, [searchText, isOpen]);

  // modal 打开 或 debouncedSearch 变化时请求
  useEffect(() => {
    if (isOpen) fetchData(debouncedSearch);
  }, [isOpen, debouncedSearch, fetchData]);

  // ── Row selection ──────────────────────────────────────────────────────────
  const handleRowClicked = useCallback(
    (event: { data: T }) => {
      const clicked = event.data;
      if (!clicked) return;
      setSelected((prev) => {
        if (!multiple) return [clicked];
        const exists = prev.some((item) => item.id === clicked.id);
        return exists
          ? prev.filter((item) => item.id !== clicked.id)
          : [...prev, clicked];
      });
    },
    [multiple],
  );

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    onChange?.(multiple ? selected : selected[0] ?? null);
  }, [selected, multiple, onChange]);

  const handleRemove = useCallback(
    (id: string | number) => {
      if (readOnly) return;
      const next = selected.filter((item) => item.id !== id);
      setSelected(next);
      onChange?.(multiple ? next : null);
    },
    [selected, multiple, onChange, readOnly],
  );

  const handleClear = useCallback(() => {
    setSelected([]);
    onChange?.(multiple ? [] : null);
  }, [multiple, onChange]);

  // ── AG Grid ────────────────────────────────────────────────────────────────
  const getRowClass = useCallback(
    (params: any) =>
      selected.some((item) => item.id === params.data?.id)
        ? "entity-selector-row-selected"
        : "",
    [selected],
  );

  useEffect(() => {
    gridApiRef.current?.redrawRows();
  }, [selected]);

  const onGridReady = useCallback((params: { api: GridApi }) => {
    gridApiRef.current = params.api;
  }, []);

  // ── Chip renderer ──────────────────────────────────────────────────────────
  const defaultRenderChip = useCallback(
    (item: T, onRemove: () => void) => (
      <View className="flex-row items-center bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1 mr-1.5 mb-1">
        <Text className="text-sm text-blue-800 font-medium">
          {item[displayField]}
        </Text>
        {!readOnly && (
          <Pressable
            onPress={onRemove}
            className="ml-1.5 p-0.5 rounded-full hover:bg-blue-100 active:bg-blue-200"
          >
            <XMarkIcon size={14} className="text-blue-400" />
          </Pressable>
        )}
      </View>
    ),
    [displayField, readOnly],
  );

  // ── Derived ────────────────────────────────────────────────────────────────
  const closeModal = useCallback(() => setIsOpen(false), []);
  const modalTitle = title ?? `${i18n.t("Select")} ${contentType}`;
  const placeholderText =
    searchPlaceholder ?? `${i18n.t("Select")} ${title ?? contentType}`;

  return {
    isOpen,
    setIsOpen,
    options,
    selected,
    loading,
    searchText,
    columnDefs,
    readOnly,
    handleSearch: setSearchText,
    handleRowClicked,
    handleConfirm,
    handleRemove,
    handleClear,
    getRowClass,
    onGridReady,
    defaultRenderChip,
    closeModal,
    modalTitle,
    placeholderText,
  };
}
