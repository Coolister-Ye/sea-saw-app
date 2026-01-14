import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { GridApi } from "ag-grid-community";
import {
  PencilSquareIcon,
  EllipsisVerticalIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "react-native-heroicons/outline";

import useDataService from "@/hooks/useDataService";
import { devError, devWarn } from "@/utils/logger";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { DeleteActionCell } from "./DeleteActionCell";
import { focusFirstEditableCol } from "./utils";
import type { ActionCellProps } from "./interface";

/* ═══════════════════════════════════════════════════════════════════════════
   ACTION CELL COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

function ActionCell({
  suppressUpdate = false,
  suppressDelete = false,
  api,
  node,
  data,
  table,
}: ActionCellProps) {
  const { getViewSet } = useDataService();
  const viewSet = useMemo(() => getViewSet(table), [getViewSet, table]);
  const menuTriggerRef = useRef<any>(null);

  if (suppressUpdate && suppressDelete) {
    return null;
  }

  const isEditing = data?.actions === "update";

  const handleStartEdit = () => {
    const editingCells = api.getEditingCells();
    if (node.rowIndex != null && editingCells.length === 0) {
      node.setDataValue("actions", "update");
      focusFirstEditableCol(api, node.rowIndex);
    }
  };

  const handleDelete = async () => {
    const id = data?.pk ?? data?.id;
    if (!id) {
      devWarn("Cannot delete: no ID found in row data");
      return;
    }

    try {
      const response = await viewSet.delete({ id });
      if (response.status) {
        api.applyServerSideTransaction({ remove: [data] });
      } else {
        devWarn("Delete failed:", response);
      }
    } catch (error) {
      devError("Delete error:", error);
    }
  };

  return (
    <View className="flex-row h-full items-center justify-end gap-1">
      {isEditing ? (
        <EditingActions api={api} node={node} />
      ) : (
        <>
          {!suppressUpdate && <EditButton onPress={handleStartEdit} />}
          {!suppressDelete && (
            <DeleteDropdown
              triggerRef={menuTriggerRef}
              onDelete={handleDelete}
            />
          )}
        </>
      )}
    </View>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */

function EditButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="p-1 rounded hover:bg-gray-100 active:bg-gray-200 transition-colors"
    >
      <PencilSquareIcon size={18} className="text-zinc-500" />
    </Pressable>
  );
}

type EditingActionsProps = {
  api: GridApi;
  node: any;
};

function EditingActions({ api, node }: EditingActionsProps) {
  const [originalData, setOriginalData] = useState<any>(null);

  useEffect(() => {
    if (node?.data) {
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
    <View className="flex-row h-full items-center justify-end gap-1">
      <Pressable
        onPress={handleSave}
        className="p-1 rounded hover:bg-green-50 active:bg-green-100 transition-colors"
      >
        <CheckCircleIcon size={18} className="text-green-600" />
      </Pressable>
      <Pressable
        onPress={handleCancel}
        className="p-1 rounded hover:bg-red-50 active:bg-red-100 transition-colors"
      >
        <XCircleIcon size={18} className="text-red-500" />
      </Pressable>
    </View>
  );
}

type DeleteDropdownProps = {
  triggerRef: React.RefObject<any>;
  onDelete: () => void;
};

function DeleteDropdown({ triggerRef, onDelete }: DeleteDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild ref={triggerRef}>
        <Pressable className="p-1 rounded hover:bg-gray-100 active:bg-gray-200 transition-colors">
          <EllipsisVerticalIcon size={18} className="text-zinc-500" />
        </Pressable>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={4}
        className="bg-white border border-gray-200 rounded-lg shadow-lg min-w-[120px]"
      >
        <DropdownMenuItem className="p-0">
          <DeleteActionCell
            handleCancel={() => triggerRef.current?.close()}
            handleDelete={onDelete}
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { ActionCell };
