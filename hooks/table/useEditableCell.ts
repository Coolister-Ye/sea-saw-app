import { useRef, useCallback } from "react";
import { router } from "expo-router";
import { isEqual } from "lodash";
import i18n from "@/locale/i18n";
import { deleteLevel, flattenData, unFlattenData, mergeData } from "@/utils";
import { useToast } from "@/context/Toast";
import type { TableAction } from "./tableReducer";

export const NEWKEY = "-1";

/**
 * 为每行数据生成唯一 key（基于 pk 字段 Base64 编码）
 */
export function assignKey(data: any[]): any[] {
  return data.map((item) => {
    const rawKey = Object.entries(item)
      .filter(([value]) => value.endsWith("pk"))
      .map(([value, key]) => `${value}-${key}`)
      .join(":");
    return { ...item, key: btoa(rawKey) };
  });
}

interface UseEditableCellOptions {
  table: string;
  tableRef: React.RefObject<any>;
  viewSet: any;
  getViewSet: (table: string) => any;
  flatData: any[];
  columnsRef: React.MutableRefObject<any>;
  dataRef: React.MutableRefObject<any>;
  flatDataRef: React.MutableRefObject<any>;
  flatColumnsRef: React.MutableRefObject<any>;
  dispatch: React.Dispatch<TableAction>;
  /** 操作完成后刷新表格数据 */
  onRefresh: () => void;
}

export function useEditableCell({
  table,
  tableRef,
  viewSet,
  getViewSet,
  flatData,
  columnsRef,
  dataRef,
  flatDataRef,
  flatColumnsRef,
  dispatch,
  onRefresh,
}: UseEditableCellOptions) {
  const editingKeyRef = useRef<string>("");
  const { showToast } = useToast();

  const handleAdd = useCallback(() => {
    if (editingKeyRef.current !== "") {
      showToast({ message: i18n.t("Exit row editing mode first") });
      return;
    }
    editingKeyRef.current = NEWKEY;
    dispatch({ type: "SET_FLAT_DATA", payload: [{ key: NEWKEY }, ...flatData] });
    dispatch({ type: "SET_EDITING_KEY", payload: NEWKEY });
    setTimeout(() => {
      tableRef.current?.scrollTo({ key: NEWKEY });
    }, 0);
  }, [flatData, dispatch, tableRef, showToast]);

  const handleEdit = useCallback(
    (record: any) => {
      editingKeyRef.current = record.key;
      dispatch({ type: "SET_EDITING_KEY", payload: record.key });
    },
    [dispatch],
  );

  const handleCancel = useCallback(() => {
    dispatch({ type: "SET_EDITING_KEY", payload: "" });
    editingKeyRef.current = "";
    dispatch({ type: "SET_FLAT_DATA", payload: flatDataRef.current });
  }, [dispatch, flatDataRef]);

  const handleSave = useCallback(
    async (prevRecord: any, newRecord: any) => {
      if (isEqual(prevRecord, newRecord)) return handleCancel();
      const unflattenedData = unFlattenData(newRecord, columnsRef.current);

      const response = newRecord.pk
        ? await viewSet.update({ id: newRecord.pk, body: unflattenedData })
        : await viewSet.create({ body: unflattenedData });

      if (response?.status) {
        onRefresh();
        editingKeyRef.current = "";
      } else if (response?.error?.status === "auth-error") {
        router.navigate("/login");
      } else {
        console.error("Save Error:", response);
      }
    },
    [viewSet, columnsRef, handleCancel, onRefresh],
  );

  const handleDelete = useCallback(
    async (record: any) => {
      const deleteItems: [string, any][] = deleteLevel(record, columnsRef.current);
      await Promise.all(
        deleteItems.map(([item, pk]: [string, any]) => {
          const contentType = item.split(".");
          const tableName =
            item === "pk" ? table : contentType[contentType.length - 2];
          return getViewSet(tableName).delete({ id: pk });
        }),
      );
      onRefresh();
    },
    [table, columnsRef, getViewSet, onRefresh],
  );

  const splitRecord = useCallback(
    (record: any, value: string) => {
      const filteredRecord = Object.fromEntries(
        Object.entries(record).filter(([k]) => !k.startsWith(value)),
      );
      const newRecord = unFlattenData(
        { ...filteredRecord, [`${value}.pk`]: NEWKEY },
        columnsRef.current,
      );
      const updatedData = dataRef.current.map((item: { pk: any }) =>
        item.pk === newRecord.pk
          ? mergeData(newRecord, item, columnsRef.current)
          : item,
      );
      const updatedFlatData = assignKey(
        flattenData(
          updatedData,
          flatColumnsRef.current.map((col: { dataIndex: any }) => col.dataIndex),
          [],
        ),
      );
      const newKey = updatedFlatData.find(
        (item: any) => item[`${value}.pk`] === NEWKEY,
      )?.key;
      editingKeyRef.current = newKey;
      dispatch({ type: "SET_FLAT_DATA", payload: updatedFlatData });
    },
    [columnsRef, dataRef, flatColumnsRef, dispatch],
  );

  return {
    editingKeyRef,
    handleAdd,
    handleEdit,
    handleCancel,
    handleSave,
    handleDelete,
    splitRecord,
  };
}
