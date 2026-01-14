import React, { useState, useEffect, useCallback, useMemo, forwardRef } from "react";
import { View, Pressable, Modal, TouchableWithoutFeedback } from "react-native";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import { Input } from "antd";

import { useLocale } from "@/context/Locale";
import useDataService from "@/hooks/useDataService";
import { FormDef } from "@/hooks/useFormDefs";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";

/* ========================
 * Types
 * ======================== */
export interface EntityItem {
  id: string | number;
  [key: string]: any;
}

export interface EntitySelectorProps<T extends EntityItem> {
  def?: FormDef;
  value?: T | T[] | null;
  onChange?: (v: T | T[] | null) => void;
  multiple?: boolean;

  // Entity-specific config
  contentType: string; // e.g., "company", "contact"
  columns: ColDef[]; // AG Grid column definitions
  displayField: string; // Field to display in the input (e.g., "company_name")
  searchPlaceholder?: string;
  title?: string;

  // Optional customization
  mapResponseToItems?: (response: any) => T[];
  renderSelectedChip?: (item: T, onRemove: () => void) => React.ReactNode;
}

/* ========================
 * Utils
 * ======================== */
const normalizeValue = <T extends EntityItem>(
  value?: T | T[] | null,
  multiple?: boolean
): T[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return multiple ? [value] : [value];
};

/* ========================
 * Component
 * ======================== */
const EntitySelectorInner = <T extends EntityItem>(
  {
    def,
    value,
    onChange,
    multiple = false,
    contentType,
    columns,
    displayField,
    searchPlaceholder,
    title,
    mapResponseToItems,
    renderSelectedChip,
  }: EntitySelectorProps<T>,
  ref: React.Ref<HTMLDivElement>
) => {
  const { i18n } = useLocale();
  const { getViewSet } = useDataService();
  const viewSet = useMemo(() => getViewSet(contentType), [getViewSet, contentType]);

  const readOnly = def?.read_only === true;

  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<T[]>([]);
  const [selected, setSelected] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [gridApi, setGridApi] = useState<any>(null);

  /* ========================
   * Sync value
   * ======================== */
  useEffect(() => {
    setSelected(normalizeValue(value, multiple));
  }, [value, multiple]);

  /* ========================
   * Fetch data
   * ======================== */
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
        console.error(`Failed to fetch ${contentType}:`, error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    },
    [viewSet, contentType, mapResponseToItems]
  );

  useEffect(() => {
    if (isOpen) {
      fetchData(searchText);
    }
  }, [isOpen, fetchData, searchText]);

  /* ========================
   * Handlers
   * ======================== */
  const handleSearch = useCallback((text: string) => {
    setSearchText(text);
  }, []);

  const handleRowClicked = useCallback(
    (event: any) => {
      const clickedItem = event.data as T;

      if (multiple) {
        const isSelected = selected.some((item) => item.id === clickedItem.id);
        if (isSelected) {
          setSelected(selected.filter((item) => item.id !== clickedItem.id));
        } else {
          setSelected([...selected, clickedItem]);
        }
      } else {
        setSelected([clickedItem]);
      }
    },
    [selected, multiple]
  );

  const handleConfirm = useCallback(() => {
    // Close modal first to prevent re-fetch
    setIsOpen(false);

    // Then trigger onChange callback
    if (multiple) {
      onChange?.(selected);
    } else {
      onChange?.(selected[0] || null);
    }
  }, [selected, multiple, onChange]);

  const handleRemove = useCallback(
    (id: string | number) => {
      if (readOnly) return;
      const next = selected.filter((item) => item.id !== id);
      setSelected(next);

      if (multiple) {
        onChange?.(next);
      } else {
        onChange?.(null);
      }
    },
    [selected, multiple, onChange, readOnly]
  );

  const handleClear = useCallback(() => {
    setSelected([]);
    if (multiple) {
      onChange?.([]);
    } else {
      onChange?.(null);
    }
  }, [multiple, onChange]);

  /* ========================
   * Row style
   * ======================== */
  const getRowStyle = useCallback(
    (params: any) => {
      const isSelected = selected.some((item) => item.id === params.data.id);
      return isSelected ? { backgroundColor: "#e3f2fd" } : undefined;
    },
    [selected]
  );

  /* ========================
   * Default chip renderer
   * ======================== */
  const defaultRenderChip = useCallback(
    (item: T, onRemove: () => void) => (
      <View className="flex-row items-center bg-gray-100 rounded px-2 py-0.5">
        <Text className="text-sm mr-1">{item[displayField]}</Text>
        {!readOnly && (
          <Pressable onPress={onRemove}>
            <Text className="text-red-400 text-xs hover:text-red-600">×</Text>
          </Pressable>
        )}
      </View>
    ),
    [displayField, readOnly]
  );

  /* ========================
   * Render
   * ======================== */
  return (
    <View className="w-full" ref={ref as any}>
      {/* ========================
       * Selected (Input-like)
       * ======================== */}
      <Pressable
        disabled={readOnly}
        onPress={() => !readOnly && setIsOpen(true)}
        className={`
          min-h-[36px] px-2 py-1 rounded-md border
          flex-row flex-wrap items-center gap-1
          ${readOnly ? "bg-gray-50 border-gray-200" : "border-gray-300"}
        `}
      >
        {selected.length === 0 ? (
          <Text className="text-gray-400 text-sm">
            {searchPlaceholder || `${i18n.t("Select")} ${title || contentType}`}
          </Text>
        ) : (
          selected.map((item) => (
            <View key={item.id}>
              {renderSelectedChip
                ? renderSelectedChip(item, () => handleRemove(item.id))
                : defaultRenderChip(item, () => handleRemove(item.id))}
            </View>
          ))
        )}
      </Pressable>

      {/* ========================
       * Modal with AG Grid Table
       * ======================== */}
      {!readOnly && (
        <Modal visible={isOpen} transparent animationType="fade">
          <View className="flex-1 justify-center items-center">
            <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
              <View className="absolute inset-0 bg-black/40" />
            </TouchableWithoutFeedback>

            <View className="bg-white rounded-lg w-full md:w-[900px] max-h-[80vh] p-5">
              {/* Header */}
              <Text className="text-lg font-semibold mb-3">
                {title || `${i18n.t("Select")} ${contentType}`}
              </Text>

              {/* Search */}
              <View className="mb-3">
                <Input
                  placeholder={searchPlaceholder || i18n.t("Search...")}
                  value={searchText}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full"
                />
              </View>

              {/* AG Grid Table */}
              <View className="h-[400px] mb-3">
                <div
                  className="ag-theme-alpine"
                  style={{ height: "100%", width: "100%" }}
                >
                  <AgGridReact
                    rowData={options}
                    columnDefs={columns}
                    onGridReady={(params) => setGridApi(params.api)}
                    onRowClicked={handleRowClicked}
                    getRowStyle={getRowStyle}
                    loading={loading}
                    rowSelection={multiple ? "multiple" : "single"}
                    pagination={false}
                    domLayout="normal"
                  />
                </div>
              </View>

              {/* Selected Count */}
              {multiple && selected.length > 0 && (
                <Text className="text-sm text-gray-600 mb-2">
                  {i18n.t("Selected")}: {selected.length}
                </Text>
              )}

              {/* Footer */}
              <View className="flex-row justify-end gap-2">
                <Button variant="outline" onPress={handleClear}>
                  <Text>{i18n.t("Clear")}</Text>
                </Button>
                <Button variant="outline" onPress={() => setIsOpen(false)}>
                  <Text>{i18n.t("Cancel")}</Text>
                </Button>
                <Button onPress={handleConfirm} disabled={loading}>
                  <Text className="text-white">{i18n.t("Confirm")}</Text>
                </Button>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

// Use forwardRef with generic type
const EntitySelector = forwardRef(EntitySelectorInner) as <T extends EntityItem>(
  props: EntitySelectorProps<T> & { ref?: React.Ref<HTMLDivElement> }
) => ReturnType<typeof EntitySelectorInner>;

export default EntitySelector;
export { EntitySelector };
