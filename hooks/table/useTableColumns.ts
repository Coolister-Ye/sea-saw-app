import { useCallback } from "react";
import i18n from "@/locale/i18n";
import { flattenHeaderMeta, flattenData } from "@/utils";
import { EllipsisTooltip } from "@/components/sea-saw-design/table/antd/EllipsisTooltip";
import { ActionCell } from "@/components/sea-saw-design/table/antd/AntdActionCell";
import { formatCurrency, formatPercentage } from "@/utils";
import React from "react";
import { assignKey, NEWKEY } from "./useEditableCell";
import type { TableAction } from "./tableReducer";

interface UseTableColumnsOptions {
  defaultColWidth?: number;
  fixedCols?: Partial<Record<"left" | "right", string[]>>;
  colConfig?: Record<string, any>;
  actionConfig?: Record<string, any>;
  /** Refs managed by the parent useTable hook */
  columnsRef: React.MutableRefObject<any>;
  flatColumnsRef: React.MutableRefObject<any>;
  columnsPref: React.MutableRefObject<any>;
  dataRef: React.MutableRefObject<any>;
  flatDataRef: React.MutableRefObject<any>;
  editingKeyRef: React.MutableRefObject<string>;
  dispatch: React.Dispatch<TableAction>;
}

export function useTableColumns({
  defaultColWidth = 120,
  fixedCols,
  colConfig = {},
  actionConfig,
  columnsRef,
  flatColumnsRef,
  columnsPref,
  dataRef,
  flatDataRef,
  editingKeyRef,
  dispatch,
}: UseTableColumnsOptions) {
  /**
   * 将后端 OPTIONS metadata 转换为 Ant Design Table 列配置。
   * handleSave / handleCancel / handleEdit / handleDelete 作为运行时参数传入，
   * 避免与 useEditableCell 产生初始化阶段的循环依赖。
   */
  const processColumns = useCallback(
    (
      columnsMeta: any,
      columnPref: Array<{ dataIndex: string; hidden?: boolean }>,
      handlers: {
        handleSave: (prev: any, next: any) => Promise<void>;
        handleCancel: () => void;
        handleEdit: (record: any) => void;
        handleDelete: (record: any) => void;
        splitRecord: (record: any, value: string) => void;
      },
    ) => {
      const { headers, splits } = flattenHeaderMeta(columnsMeta);

      const getVariant = (col: any) =>
        colConfig?.[col.dataIndex]?.variant ||
        col.field_type ||
        (col.type === "choice" && "picklist") ||
        (["datetime", "date"].includes(col.type) ? "datepicker" : undefined);

      const getFormatter = (variant?: string): ((val: any) => any) => {
        if (!variant) return (val) => val;
        const match = variant.match(/([a-zA-Z]+)(\d+)?/);
        if (!match) return (val) => val;
        const [, type, decimalStr] = match;
        const decimals = decimalStr ? parseInt(decimalStr, 10) : 2;
        const formatters: Record<string, (val: any) => any> = {
          currency: (val) => formatCurrency(val, decimals),
          percentage: (val) => formatPercentage(val, decimals),
        };
        return formatters[type] || ((val) => val);
      };

      const isIdExist = (dataIndex: string) => {
        const prefix = dataIndex.split(".").slice(0, -1).join(".");
        return headers.some(({ dataIndex }) =>
          [`${prefix}.pk`, `${prefix}.id`].includes(dataIndex),
        );
      };

      const createOnCell = (record: any, col: any, isEditable: boolean) => ({
        record,
        editable: isEditable,
        dataIndex: col.dataIndex,
        title: col.title,
        required: isIdExist(col.dataIndex) ? col.required : false,
        rowSpan: record[`${col.dataIndex}.rowSpan`] ?? 1,
        handleSave: isEditable ? handlers.handleSave : undefined,
        isRowEditing: editingKeyRef.current === record.key,
        editingKey: editingKeyRef.current,
        options: col.choices,
        variant: col.variant,
        dataType: col.type,
        getOptions: col.getOptions,
      });

      // Sort by user preferences
      const sortedHeaders = columnPref
        .filter((pref) =>
          headers.some((header) => header.dataIndex === pref.dataIndex),
        )
        .map((pref) =>
          headers.find((header) => header.dataIndex === pref.dataIndex),
        );
      const remainingHeaders = headers.filter(
        (header) =>
          !columnPref.some((pref) => pref.dataIndex === header.dataIndex),
      );
      const finalSortedHeaders = [...sortedHeaders, ...remainingHeaders];

      const processedHeaders = finalSortedHeaders.map((_col: any, index: number) => {
        const variant = getVariant(_col);
        const formater = getFormatter(variant);
        const userConf = columnPref.find((pref) => pref.dataIndex === _col.dataIndex);
        const initialConf = colConfig?.[_col.dataIndex] || {};
        const extraConf = { ...initialConf, ...userConf };
        const col = { ..._col, ...extraConf, variant, formater };
        const fixed = fixedCols?.right?.includes(_col.dataIndex)
          ? "right"
          : fixedCols?.left?.includes(_col.dataIndex)
            ? "left"
            : undefined;
        return {
          ...col,
          id: index,
          label: col.title,
          hidden: false,
          width: defaultColWidth || 100,
          fixed,
          options: col.choices,
          render: (text: string) => (
            <EllipsisTooltip title={text}>
              {text ? formater(text) : ""}
            </EllipsisTooltip>
          ),
          onCell: (record: any) => createOnCell(record, col, !col.read_only),
          ...extraConf,
        };
      });

      // Action column
      const { allowAdd, allowDelete, allowEdit } = actionConfig || {};
      if (allowAdd === false && allowDelete === false && allowEdit === false) {
        return processedHeaders;
      }

      const generateActionOptions = (record: any) =>
        splits
          .map((value: string) => {
            const path = value.split(".");
            const child = path[path.length - 1];
            const isParentExist =
              record[`${value}.pk`] !== null &&
              record[`${value}.pk`] !== undefined;
            if (!isParentExist) return null;
            return {
              key: value,
              label: i18n.t(child),
              onAction: () => handlers.splitRecord(record, value),
            };
          })
          .filter(Boolean);

      const actionColumn = {
        title: "operation",
        dataIndex: "operation",
        fixed: "right",
        width: defaultColWidth,
        render: (_: any, record: any) => (
          <ActionCell
            isRowEditing={editingKeyRef.current === record.key}
            record={record}
            addOptions={
              allowAdd === false ? undefined : generateActionOptions(record)
            }
            editingKey={editingKeyRef.current}
            handleSave={handlers.handleSave}
            handleCancel={handlers.handleCancel}
            handleEdit={() => handlers.handleEdit(record)}
            handleDelete={
              allowDelete === false ? undefined : () => handlers.handleDelete(record)
            }
          />
        ),
      };

      return [...processedHeaders, actionColumn];
    },
    [colConfig, actionConfig, fixedCols, defaultColWidth, editingKeyRef],
  );

  /** 列顺序拖拽后重新处理 flatData */
  const handleColsRerange = useCallback(
    (columns: any) => {
      let processedData = assignKey(
        flattenData(
          dataRef.current,
          flatColumnsRef.current.map((col: { dataIndex: any }) => col.dataIndex),
          [],
        ),
      );
      flatDataRef.current = processedData;
      if (editingKeyRef.current !== "") {
        processedData = [{ key: NEWKEY }, ...processedData];
      }
      dispatch({ type: "SET_COLUMNS", payload: columns });
      dispatch({ type: "SET_FLAT_DATA", payload: processedData });
    },
    [dataRef, flatColumnsRef, flatDataRef, editingKeyRef, dispatch],
  );

  return { processColumns, handleColsRerange };
}
