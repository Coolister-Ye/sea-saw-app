import { GestureResponderEvent, Pressable, View } from "react-native";
import { useEffect, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/sea-saw-design/dropdown-menu";
import {
  PencilSquareIcon,
  EllipsisVerticalIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "react-native-heroicons/outline";
import useDataService from "@/hooks/useDataService";
import { CustomCellRendererProps } from "ag-grid-react";

type ActionCellProps = CustomCellRendererProps & {
  suppressUpdate?: boolean;
  suppressDelete?: boolean;
  onEdit: (data: any) => void;
};

function ActionCell({ api, data, onEdit }: ActionCellProps) {
  const menuTriggerRef = useRef<any>(null);
  const { deleteItem } = useDataService();

  const handleEdit = (event: GestureResponderEvent) => {
    event.stopPropagation();
    onEdit(data);
  };

  // const handleDelete = async () => {
  //   try {
  //     const response = await deleteItem({
  //       id: data.pk || data.id,
  //       contentType: table,
  //     });
  //     if (response.status) {
  //       api.applyServerSideTransaction({ remove: [data] });
  //     } else {
  //       console.warn("delete fail: ", response);
  //     }
  //   } catch (error) {
  //     console.error("update fail: ", error);
  //   }
  // };

  return (
    <View className="flex-row h-full items-center justify-end space-x-1">
      <Pressable onPress={handleEdit}>
        <PencilSquareIcon className="h-5 text-zinc-500 active:text-zinc-400" />
      </Pressable>
      {/* <DeleteDropdown triggerRef={menuTriggerRef} handleDelete={handleDelete} /> */}
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
          {/* <DeleteActionCell
            handleCancel={() => triggerRef.current?.close()}
            handleDelete={handleDelete}
          /> */}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { ActionCell };
