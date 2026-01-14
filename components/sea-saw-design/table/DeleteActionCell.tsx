import { View } from "react-native";
import { TrashIcon } from "react-native-heroicons/outline";

import { useLocale } from "@/context/Locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../alert-dialog";
import { Button } from "../button";
import { Text } from "../text";

/* ═══════════════════════════════════════════════════════════════════════════
   DELETE ACTION CELL
   ═══════════════════════════════════════════════════════════════════════════ */

type DeleteActionCellProps = {
  handleDelete?: () => void;
  handleCancel?: () => void;
};

function DeleteActionCell({ handleDelete, handleCancel }: DeleteActionCellProps) {
  const { i18n } = useLocale();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start px-3 py-2 hover:bg-red-50"
        >
          <View className="flex-row items-center gap-2">
            <TrashIcon size={16} className="text-red-500" />
            <Text className="text-red-600 text-sm">{i18n.t("Delete")}</Text>
          </View>
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-semibold">
            {i18n.t("Delete")}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600">
            {i18n.t(
              "This action cannot be undone. Deleting this record will move it to the Recycle Bin."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel
            onPress={handleCancel}
            className="px-4 py-2 rounded-md"
          >
            <Text className="text-gray-700">{i18n.t("Cancel")}</Text>
          </AlertDialogCancel>
          <AlertDialogAction
            onPress={handleDelete}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-md"
          >
            <Text className="text-white font-medium">{i18n.t("Confirm")}</Text>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { DeleteActionCell };
export type { DeleteActionCellProps };
