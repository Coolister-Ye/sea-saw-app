import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  forwardRef,
} from "react";
import {
  View,
  Pressable,
  Modal,
  TouchableWithoutFeedback,
  TextInput,
  ScrollView,
} from "react-native";
import { AgGridReact } from "ag-grid-react";
import i18n from "@/locale/i18n";
import type { ColDef, GridApi } from "ag-grid-community";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ChevronDownIcon,
  CheckIcon,
  Squares2X2Icon,
  XCircleIcon,
} from "react-native-heroicons/outline";

import useDataService from "@/hooks/useDataService";
import type { FormDef } from "@/hooks/useFormDefs";
import { Text } from "@/components/sea-saw-design/text";
import { Button } from "@/components/sea-saw-design/button";
import { theme } from "@/components/sea-saw-design/table/theme";
import {
  getAgFilterType,
  getFilterParams,
  getCellDataType,
  getValueFormatter,
} from "@/components/sea-saw-design/table/utils";
import type {
  HeaderMetaProps,
  ColDefinition,
} from "@/components/sea-saw-design/table/interface";
import { devError } from "@/utils/logger";

/* ═══════════════════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════════════════ */

const DEFAULT_COL_WIDTH = 120;

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

export interface EntityItem {
  id: string | number;
  [key: string]: any;
}

export interface EntitySelectorProps<T extends EntityItem> {
  def?: FormDef;
  value?: T | T[] | null;
  onChange?: (v: T | T[] | null) => void;
  multiple?: boolean;

  /** API endpoint key (maps to Constants.ts) */
  contentType: string;

  /** Field to display in the trigger input (e.g., "company_name") */
  displayField: string;

  /** Custom column definitions to override auto-generated columns */
  colDefinitions?: Record<string, ColDefinition>;

  /** Column display order (fields not listed will be appended at the end) */
  columnOrder?: string[];

  searchPlaceholder?: string;
  title?: string;

  /** Custom response mapper */
  mapResponseToItems?: (response: any) => T[];

  /** Custom chip renderer for selected items */
  renderSelectedChip?: (item: T, onRemove: () => void) => React.ReactNode;
}

/* ═══════════════════════════════════════════════════════════════════════════
   UTILITIES
   ═══════════════════════════════════════════════════════════════════════════ */

/** Type guard to check if meta is HeaderMetaProps (has 'type' field) */
function isHeaderMetaProps(
  meta: HeaderMetaProps | Record<string, HeaderMetaProps>,
): meta is HeaderMetaProps {
  return "type" in meta && typeof meta.type === "string";
}

/** Normalize header metadata from various response formats */
function normalizeHeaderMeta(
  meta: HeaderMetaProps | Record<string, HeaderMetaProps> | undefined,
): Record<string, HeaderMetaProps> {
  if (!meta) return {};

  if (isHeaderMetaProps(meta)) {
    if (meta.children) return meta.children;
    if (meta.child?.children) return meta.child.children;
    return {};
  }

  return meta;
}

/** Normalize value to array */
const normalizeValue = <T extends EntityItem>(value?: T | T[] | null): T[] => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

const DEFAULT_COL_DEF: ColDef = {
  sortable: true,
  resizable: true,
  width: DEFAULT_COL_WIDTH,
};

/* ═══════════════════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

const EntitySelectorInner = <T extends EntityItem>(
  {
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
    renderSelectedChip,
  }: EntitySelectorProps<T>,
  ref: React.Ref<View>,
) => {
  const { getViewSet } = useDataService();
  const viewSet = useMemo(
    () => getViewSet(contentType),
    [getViewSet, contentType],
  );

  const readOnly = def?.read_only === true;

  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<T[]>([]);
  const [selected, setSelected] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([]);
  const gridApiRef = useRef<GridApi | null>(null);

  /** Build column definitions from metadata */
  const buildColumnDefs = useCallback(
    (meta: Record<string, HeaderMetaProps>): ColDef[] => {
      const processedFields = new Set<string>();

      // Build columns from metadata
      const metaColumns = Object.entries(meta)
        .filter(([key]) => !colDefinitions?.[key]?.skip)
        .map(([field, fieldMeta]) => {
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

      // Add extra columns from colDefinitions not in metadata
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

      // Sort columns by columnOrder if provided
      if (columnOrder && columnOrder.length > 0) {
        const orderMap = new Map(columnOrder.map((field, idx) => [field, idx]));
        allColumns.sort((a, b) => {
          const aIdx = orderMap.get(a.field as string) ?? Infinity;
          const bIdx = orderMap.get(b.field as string) ?? Infinity;
          return aIdx - bIdx;
        });
      }

      return allColumns;
    },
    [colDefinitions, columnOrder],
  );

  /** Build columns from def metadata */
  useEffect(() => {
    setColumnDefs(buildColumnDefs(normalizeHeaderMeta(def)));
  }, [def, buildColumnDefs]);

  /** Sync external value to internal state */
  useEffect(() => {
    setSelected(normalizeValue(value));
  }, [value]);

  /** Fetch data from API */
  const fetchData = useCallback(
    async (keyword = "") => {
      setLoading(true);
      try {
        const res = await viewSet.list({
          params: { page: 1, page_size: 100, search: keyword },
        });

        const results = mapResponseToItems
          ? mapResponseToItems(res)
          : res.results?.map((item: any) => ({
              ...item,
              id: item.pk ?? item.id,
            })) || [];

        setOptions(results);
      } catch (error) {
        devError(`Failed to fetch ${contentType}:`, error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    },
    [viewSet, contentType, mapResponseToItems],
  );

  /** Fetch when modal opens or search changes */
  useEffect(() => {
    if (isOpen) fetchData(searchText);
  }, [isOpen, fetchData, searchText]);

  /* Handlers */
  const handleSearch = setSearchText;

  const handleRowClicked = useCallback(
    (event: { data: T }) => {
      const clickedItem = event.data;
      if (!clickedItem) return;

      setSelected((prev) => {
        if (!multiple) return [clickedItem];

        const isSelected = prev.some((item) => item.id === clickedItem.id);
        return isSelected
          ? prev.filter((item) => item.id !== clickedItem.id)
          : [...prev, clickedItem];
      });
    },
    [multiple],
  );

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    onChange?.(multiple ? selected : selected[0] || null);
  }, [selected, multiple, onChange]);

  const handleRemove = useCallback(
    (id: string | number) => {
      if (readOnly) return;
      setSelected((prev) => {
        const next = prev.filter((item) => item.id !== id);
        onChange?.(multiple ? next : null);
        return next;
      });
    },
    [multiple, onChange, readOnly],
  );

  const handleClear = useCallback(() => {
    setSelected([]);
    onChange?.(multiple ? [] : null);
  }, [multiple, onChange]);

  /** Row styling for selected state */
  const getRowClass = useCallback(
    (params: any) => {
      const isSelected = selected.some((item) => item.id === params.data?.id);
      return isSelected ? "entity-selector-row-selected" : "";
    },
    [selected],
  );

  /** Refresh row styles when selection changes */
  useEffect(() => {
    gridApiRef.current?.redrawRows();
  }, [selected]);

  const onGridReady = useCallback((params: { api: GridApi }) => {
    gridApiRef.current = params.api;
  }, []);

  /** Default chip renderer */
  const defaultRenderChip = useCallback(
    (item: T, onRemove: () => void) => (
      <View className="animate-chip-fade-in transition-all duration-150 hover:scale-[1.02] hover:shadow-sm flex-row items-center bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1 mr-1.5 mb-1">
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

  /* Derived values */
  const modalTitle = title || `${i18n.t("Select")} ${contentType}`;
  const placeholderText =
    searchPlaceholder || `${i18n.t("Select")} ${title || contentType}`;
  const closeModal = useCallback(() => setIsOpen(false), []);

  return (
    <View className="w-full" ref={ref}>
      {/* ═══════════════════════════════════════════════════════════════════
          TRIGGER INPUT
          ═══════════════════════════════════════════════════════════════════ */}
      <Pressable
        disabled={readOnly}
        onPress={() => !readOnly && setIsOpen(true)}
        className="min-h-8 px-3 py-1 border border-gray-300 rounded-md bg-white flex-row flex-wrap items-center transition-all duration-200 hover:border-blue-500 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 disabled:bg-black/5 disabled:cursor-not-allowed disabled:text-black/25"
      >
        {selected.length === 0 ? (
          <View className="flex-row items-center flex-1">
            <MagnifyingGlassIcon size={16} className="text-gray-400 mr-2" />
            <Text className="text-gray-400 text-sm">{placeholderText}</Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-1"
            contentContainerStyle={{ alignItems: "center" }}
          >
            {selected.map((item) => (
              <React.Fragment key={item.id}>
                {renderSelectedChip
                  ? renderSelectedChip(item, () => handleRemove(item.id))
                  : defaultRenderChip(item, () => handleRemove(item.id))}
              </React.Fragment>
            ))}
          </ScrollView>
        )}
        {!readOnly && (
          <View className="ml-2">
            <ChevronDownIcon size={18} className="text-gray-400" />
          </View>
        )}
      </Pressable>

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL
          ═══════════════════════════════════════════════════════════════════ */}
      {!readOnly && (
        <Modal visible={isOpen} transparent animationType="fade">
          <View className="flex-1 justify-center items-center">
            {/* Backdrop */}
            <TouchableWithoutFeedback onPress={closeModal}>
              <View className="absolute inset-0 bg-black/60" />
            </TouchableWithoutFeedback>

            {/* Modal Content */}
            <View className="animate-modal-slide-in bg-white rounded-2xl w-[95%] md:w-[900px] max-h-[85vh] overflow-hidden shadow-2xl">
              {/* Header */}
              <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-lg bg-blue-50 items-center justify-center mr-2">
                    <Squares2X2Icon size={18} className="text-blue-500" />
                  </View>
                  <Text className="text-base font-medium text-gray-800">
                    {modalTitle}
                  </Text>
                </View>
                <Pressable
                  onPress={closeModal}
                  className="p-1 rounded hover:bg-gray-100"
                >
                  <XMarkIcon size={20} className="text-gray-400" />
                </Pressable>
              </View>

              {/* Search Bar */}
              <View className="px-5 py-3 border-b border-gray-100">
                <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200 focus-within:border-blue-300 focus-within:bg-white">
                  <MagnifyingGlassIcon
                    size={18}
                    className="text-gray-400 mr-3"
                  />
                  <TextInput
                    placeholder={i18n.t("Search...")}
                    value={searchText}
                    onChangeText={handleSearch}
                    className="flex-1 text-sm text-gray-800 outline-none"
                    placeholderTextColor="#9ca3af"
                  />
                  {searchText.length > 0 && (
                    <Pressable
                      onPress={() => setSearchText("")}
                      className="p-1 rounded-full hover:bg-gray-200"
                    >
                      <XCircleIcon size={18} className="text-gray-400" />
                    </Pressable>
                  )}
                </View>
              </View>

              {/* AG Grid Table */}
              <View className="entity-selector-grid h-[400px] max-sm:h-[300px] px-5 py-3">
                <View className="h-full w-full">
                  <AgGridReact
                    rowData={options}
                    columnDefs={columnDefs}
                    theme={theme}
                    onGridReady={onGridReady}
                    onRowClicked={handleRowClicked}
                    getRowClass={getRowClass}
                    loading={loading}
                    rowSelection={multiple ? "multiple" : "single"}
                    pagination={false}
                    domLayout="normal"
                    suppressCellFocus
                    animateRows
                    defaultColDef={DEFAULT_COL_DEF}
                  />
                </View>
              </View>

              {/* Footer */}
              <View className="flex-row max-sm:flex-col max-sm:gap-3 items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
                {/* Selection Info */}
                <View className="flex-row items-center">
                  {multiple && selected.length > 0 && (
                    <>
                      <View className="w-6 h-6 rounded-full bg-blue-500 items-center justify-center mr-2">
                        <Text className="text-white text-xs font-bold">
                          {selected.length}
                        </Text>
                      </View>
                      <Text className="text-sm text-gray-600">
                        {i18n.t("selected")}
                      </Text>
                    </>
                  )}
                  {!multiple && selected.length > 0 && (
                    <View className="flex-row items-center bg-blue-50 px-3 py-1.5 rounded-lg">
                      <CheckIcon size={14} className="text-blue-500 mr-1.5" />
                      <Text className="text-sm text-blue-700 font-medium">
                        {selected[0]?.[displayField]}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Actions */}
                <View className="flex-row items-center gap-1">
                  <Button onPress={handleClear}>
                    <Text className="text-blue-500 underline">
                      {i18n.t("Clear")}
                    </Text>
                  </Button>
                  <Button onPress={closeModal}>
                    <Text>{i18n.t("Cancel")}</Text>
                  </Button>
                  <Button
                    type="primary"
                    onPress={handleConfirm}
                    disabled={loading}
                  >
                    <Text className="text-white font-medium">
                      {i18n.t("Confirm")}
                    </Text>
                  </Button>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   EXPORTS
   ═══════════════════════════════════════════════════════════════════════════ */

const EntitySelector = forwardRef(EntitySelectorInner) as <
  T extends EntityItem,
>(
  props: EntitySelectorProps<T> & { ref?: React.Ref<View> },
) => ReturnType<typeof EntitySelectorInner>;

export default EntitySelector;
export { EntitySelector };
