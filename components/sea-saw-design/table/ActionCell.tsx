import { Pressable, View } from "react-native";
import { useEffect, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { DeleteActionCell } from "./DeleteActionCell";
import { ActionCellProps } from "./interface";
import { ColDef, ColGroupDef, GridApi } from "ag-grid-community";
import {
  PencilSquareIcon,
  EllipsisVerticalIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "react-native-heroicons/outline";
import useDataService from "@/hooks/useDataService";

// 类型守卫：区分 ColDef 和 ColGroupDef
function isColDef(
  col: ColDef<any, any> | ColGroupDef<any>
): col is ColDef<any, any> {
  return !("children" in col);
}

// 聚焦第一个 editable 的列
function focusFirstEditableCol(api: GridApi, rowIndex: number) {
  const columnDefs = api.getColumnDefs() ?? [];
  const firstEditableCol = columnDefs.find(
    (col) => isColDef(col) && col.editable !== false && !!col.field
  );
  if (firstEditableCol && isColDef(firstEditableCol)) {
    api.setFocusedCell(rowIndex, firstEditableCol.field!);
    api.startEditingCell({ rowIndex, colKey: firstEditableCol.field! });
  }
}

function ActionCell({
  suppressUpdate = false,
  suppressDelete = false,
  api,
  node,
  data,
  table,
}: ActionCellProps) {
  const menuTriggerRef = useRef<any>(null);
  const { deleteItem } = useDataService();

  if (suppressUpdate && suppressDelete) return null;

  const handleUpdate = () => {
    const editingCells = api.getEditingCells();
    if (node.rowIndex != null && editingCells.length === 0) {
      node.setDataValue("actions", "update");
      focusFirstEditableCol(api, node.rowIndex);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await deleteItem({
        id: data.pk || data.id,
        contentType: table,
      });
      if (response.status) {
        api.applyServerSideTransaction({ remove: [data] });
      } else {
        console.warn("delete fail: ", response);
      }
    } catch (error) {
      console.error("update fail: ", error);
    }
  };

  return (
    <View className="flex-row h-full items-center justify-end space-x-1">
      {data.actions === "update" ? (
        <EditingButtonSet api={api} node={node} />
      ) : (
        <>
          {!suppressUpdate && <UpdateButton onPress={handleUpdate} />}
          {!suppressDelete && (
            <DeleteDropdown
              triggerRef={menuTriggerRef}
              handleDelete={handleDelete}
            />
          )}
        </>
      )}
    </View>
  );
}

function UpdateButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <PencilSquareIcon className="h-5 text-zinc-500 active:text-zinc-400" />
    </Pressable>
  );
}

type EditingButtonSetProps = {
  api: GridApi;
  node: any;
};

function EditingButtonSet({ api, node }: EditingButtonSetProps) {
  const [originalData, setOriginalData] = useState<any>(null);

  // 开始编辑时，保存一份原数据
  useEffect(() => {
    if (node && node.data) {
      setOriginalData({ ...node.data });
    }
  }, [node]);

  const handleSave = () => {
    node.setDataValue("actions", undefined);
    api.stopEditing();
  };

  const handleCancel = () => {
    node.setDataValue("actions", undefined);
    api.stopEditing();
    if (originalData) {
      node.setData(originalData);
    }
  };

  return (
    <View className="flex-row h-full items-center justify-end">
      <Pressable onPress={handleSave}>
        <CheckCircleIcon className="h-5 text-green-500 active:text-green-400" />
      </Pressable>
      <Pressable onPress={handleCancel}>
        <XCircleIcon className="h-5 text-red-500 active:text-red-400" />
      </Pressable>
    </View>
  );
}

function DeleteDropdown({
  triggerRef,
  handleDelete,
}: {
  triggerRef: React.RefObject<any>;
  handleDelete?: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild ref={triggerRef}>
        <Pressable>
          <EllipsisVerticalIcon
            size={20}
            className="text-zinc-500 active:text-zinc-400"
          />
        </Pressable>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={2}
        className="border-gray-100 bg-white min-w-5"
      >
        <DropdownMenuItem className="active:bg-gray-100 p-0 items-center justify-center">
          <DeleteActionCell
            handleCancel={() => triggerRef.current?.close()}
            handleDelete={handleDelete}
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { ActionCell };
