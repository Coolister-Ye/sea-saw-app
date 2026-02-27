import React from "react";
import { Form } from "antd";
import type { FormInstance } from "antd";
import { DownOutlined } from "@ant-design/icons";
import i18n from "@/locale/i18n";
import { ScrollView, View, Pressable, Text } from "react-native";
import { useMemo, useState, useEffect, useCallback } from "react";
import type { HeaderMetaProps } from "../table/interface";
import useDataService from "@/hooks/useDataService";
import {
  SearchFieldInput,
  DATE_TYPES,
  RANGE_OPERATION,
  EXACT_OPERATION,
  IN_OPERATION,
} from "./SearchFieldInput";
import type { SearchColumn } from "./SearchFieldInput";

// Types

type SearchFieldConfig = {
  /** Custom renderer - replaces SearchFieldInput. Mirrors InputForm config.render.
   *  Receives the SearchColumn and the merged HeaderMetaProps (read_only override applied). */
  render?: (col: SearchColumn, meta?: HeaderMetaProps) => React.ReactNode;
  /** Override read_only from metadata. Mirrors InputForm config.read_only. */
  read_only?: boolean;
  /** If true, hide this field from the search panel entirely. Mirrors InputForm config.hidden. */
  hidden?: boolean;
  /** If true, exclude this field from filter params (for display-only entity objects). */
  skipFilter?: boolean;
};

type SearchFormProps = {
  /** Form instance from parent (same pattern as InputForm) */
  form: FormInstance;
  /** Manual columns — overrides auto-generation from metadata */
  columns?: SearchColumn[];
  /** Auto-fetch OPTIONS metadata for this table */
  table?: string;
  /** Pre-fetched OPTIONS metadata */
  metadata?: Record<string, HeaderMetaProps>;
  /** Called with transformed filter params on form submit */
  onFinish?: (filterParams: Record<string, string>) => void;
  /** Show operation selector (default: true) */
  showOperationSelector?: boolean;
  /** Form layout: 'vertical' = one field per row, 'grid' = multiple per row */
  layout?: "vertical" | "grid";
  /** Number of rows visible when collapsed in grid mode (default: 1) */
  collapsedRows?: number;
  className?: string;
  /** Per-field overrides. Mirrors InputForm's config pattern. */
  config?: Record<string, SearchFieldConfig>;
};

/** Preprocessed item ready for rendering — mirrors InputForm's formItems pattern */
type SearchItem = {
  col: SearchColumn;
  /** HeaderMetaProps with config.read_only merged in (equivalent to InputForm's modifiedCol) */
  mergedMeta: HeaderMetaProps | undefined;
  render: SearchFieldConfig["render"];
};

// Utilities

export const buildFilterParams = (
  values: Record<string, any>,
): Record<string, string> => {
  const filterParams: Record<string, string> = {};

  Object.entries(values).forEach(([key, value]) => {
    if (key.includes("-operation") || value == null || value === "") return;

    const operation = values[`${key}-operation`] ?? EXACT_OPERATION;

    if (operation === RANGE_OPERATION) {
      if (Array.isArray(value) && value.length === 2) {
        filterParams[`${key}__gte`] = value[0];
        filterParams[`${key}__lte`] = value[1];
      } else if (typeof value === "object" && value.min !== undefined) {
        filterParams[`${key}__gte`] = value.min;
        filterParams[`${key}__lte`] = value.max;
      }
    } else if (operation === EXACT_OPERATION) {
      filterParams[key] = Array.isArray(value) ? value.join(",") : value;
    } else if (operation === IN_OPERATION) {
      filterParams[`${key}__${operation}`] = Array.isArray(value)
        ? value.join(",")
        : value;
    } else {
      filterParams[`${key}__${operation}`] = value;
    }
  });

  return filterParams;
};

export const generateColumnsFromMetadata = (
  metadata: Record<string, HeaderMetaProps>,
): SearchColumn[] => {
  return Object.entries(metadata)
    .filter(([, meta]) => meta.operations && meta.operations.length > 0)
    .map(([field, meta]) => {
      let variant: SearchColumn["variant"] = "text";

      if (meta.choices && meta.choices.length > 0) {
        variant = "picklist";
      } else if (DATE_TYPES.has(meta.type)) {
        variant = "datepicker";
      } else if (meta.type === "nested object" || meta.type === "field") {
        variant = "lookup";
      }

      return {
        title: meta.label,
        dataIndex: field,
        operations: meta.operations,
        options: meta.choices,
        variant,
        type: meta.type,
      };
    });
};

// Constants

const FIELDS_PER_ROW = 3;

// Component

export function SearchForm({
  form,
  columns: manualColumns,
  table,
  metadata: providedMetadata,
  onFinish,
  showOperationSelector = true,
  layout = "vertical",
  collapsedRows = 1,
  className,
  config,
}: SearchFormProps) {
  const { getViewSet } = useDataService();
  const [fetchedMetadata, setFetchedMetadata] = useState<Record<
    string,
    HeaderMetaProps
  > | null>(null);
  const [expanded, setExpanded] = useState(false);

  // Auto-fetch OPTIONS metadata when table is provided (and no manual source)
  const viewSet = useMemo(
    () => (table ? getViewSet(table) : null),
    [getViewSet, table],
  );

  useEffect(() => {
    if (!table || !viewSet || manualColumns || providedMetadata) return;

    let cancelled = false;
    (async () => {
      try {
        const response = await viewSet.options();
        const meta: Record<string, HeaderMetaProps> =
          response?.data?.actions?.POST ?? {};
        if (!cancelled) setFetchedMetadata(meta);
      } catch {
        if (!cancelled) setFetchedMetadata(null);
      }
    })();

    return () => { cancelled = true; };
  }, [viewSet, table, manualColumns, providedMetadata]);

  const metadata = providedMetadata ?? fetchedMetadata;

  // Resolve columns: manual > auto-generated from metadata
  const autoColumns = useMemo(
    () => (metadata ? generateColumnsFromMetadata(metadata) : []),
    [metadata],
  );
  const columns = manualColumns ?? autoColumns;

  // Only keep columns that have filter operations defined
  const searchableColumns = useMemo(
    () => columns.filter((col) => col.operations && col.operations.length > 0),
    [columns],
  );

  // Preprocess columns with config applied — mirrors InputForm's formItems useMemo.
  // Applies hidden/read_only overrides and extracts the render function up front so JSX stays clean.
  const searchItems = useMemo<SearchItem[]>(
    () =>
      searchableColumns
        .filter((col) => !config?.[col.dataIndex]?.hidden)
        .map((col) => {
          const fieldConfig = config?.[col.dataIndex];
          const rawMeta = metadata?.[col.dataIndex];
          const mergedMeta =
            fieldConfig?.read_only !== undefined
              ? ({ ...rawMeta, read_only: fieldConfig.read_only } as HeaderMetaProps)
              : rawMeta;
          return { col, mergedMeta, render: fieldConfig?.render };
        }),
    [searchableColumns, config, metadata],
  );

  // Grid collapse logic
  const isGrid = layout === "grid";
  const collapsedCount = collapsedRows * FIELDS_PER_ROW;
  const needsExpand = isGrid && searchItems.length > collapsedCount;

  const visibleItems = useMemo(
    () =>
      isGrid && !expanded && needsExpand
        ? searchItems.slice(0, collapsedCount)
        : searchItems,
    [isGrid, expanded, needsExpand, searchItems, collapsedCount],
  );

  // On submit: use getFieldsValue(true) to capture values written by custom renderers
  // (e.g. account_id set by AccountSelector via form.setFieldsValue), then strip
  // skipFilter fields (display-only entity objects) before building filter params.
  const handleFinish = useCallback(
    (_values: Record<string, any>) => {
      const allValues = form.getFieldsValue(true);
      const filteredValues: Record<string, any> = {};
      Object.entries(allValues).forEach(([key, value]) => {
        if (!config?.[key]?.skipFilter) filteredValues[key] = value;
      });
      onFinish?.(buildFilterParams(filteredValues));
    },
    [form, config, onFinish],
  );

  // Render a single field — custom renderer or default SearchFieldInput
  const renderFieldContent = useCallback(
    ({ col, mergedMeta, render }: SearchItem) =>
      render ? (
        render(col, mergedMeta)
      ) : (
        <SearchFieldInput {...col} showOperationSelector={showOperationSelector} />
      ),
    [showOperationSelector],
  );

  const commonFormProps = {
    form,
    name: `searchForm_${table}`,
    onFinish: handleFinish,
    colon: false,
  };

  // Grid layout

  if (isGrid) {
    const shouldScroll = expanded && searchItems.length > FIELDS_PER_ROW * 3;

    const gridFields = (
      <View
        className={`flex flex-row flex-wrap gap-x-4 gap-y-1 ${className ?? ""}`}
      >
        {visibleItems.map((item) => (
          <View
            key={item.col.dataIndex}
            className="w-[calc(33.33%-12px)] min-w-[200px]"
          >
            <Form.Item
              label={item.col.title}
              name={item.render ? item.col.dataIndex : undefined}
              className="mb-1"
            >
              {renderFieldContent(item)}
            </Form.Item>
          </View>
        ))}

        {needsExpand && (
          <View className="w-full flex flex-row justify-end pb-[5px]">
            <Pressable
              onPress={() => setExpanded((prev) => !prev)}
              className="flex flex-row items-center gap-1"
            >
              <Text className="text-xs">
                {expanded ? i18n.t("collapse") : i18n.t("more")}
              </Text>
              <DownOutlined
                rotate={expanded ? 180 : 0}
                style={{ fontSize: 10 }}
              />
            </Pressable>
          </View>
        )}
      </View>
    );

    return (
      <Form {...commonFormProps} layout="vertical" className="px-3 py-2">
        {shouldScroll ? (
          <ScrollView style={{ maxHeight: 280 }}>{gridFields}</ScrollView>
        ) : (
          gridFields
        )}
      </Form>
    );
  }

  // Vertical layout

  return (
    <ScrollView className={className}>
      <Form {...commonFormProps} layout="vertical" className="px-3">
        {searchItems.map((item) => (
          <Form.Item
            key={item.col.dataIndex}
            label={item.col.title}
            name={item.render ? item.col.dataIndex : undefined}
            className="mb-2"
          >
            {renderFieldContent(item)}
          </Form.Item>
        ))}
      </Form>
    </ScrollView>
  );
}

export type { SearchFormProps, SearchFieldConfig, SearchColumn };
