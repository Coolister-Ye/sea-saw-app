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
import { TrashIcon } from "react-native-heroicons/outline";
import { View } from "react-native";
import { useLocale } from "@/context/Locale";

function DeleteActionCell({
  handleDelete,
  handleCancel,
}: {
  handleDelete?: () => void;
  handleCancel?: () => void;
}) {
  const { i18n } = useLocale();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          textClassName="text-red-500"
          variant="outline"
          className="w-fit bg-red-100 hover:bg-red-200 border-red-200"
        >
          <View className="flex-row p-1">
            <TrashIcon size={20} className="h-5 text-red-500" />
            <Text className="ml-1">{i18n.t("Delete")}</Text>
          </View>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{i18n.t("Delete")}</AlertDialogTitle>
          <AlertDialogDescription>
            {i18n.t(
              "This action cannot be undone. Deleting this record will move it to the Recycle Bin."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onPress={handleCancel}>
            <Text>{i18n.t("Cancel")}</Text>
          </AlertDialogCancel>
          <AlertDialogAction onPress={handleDelete}>
            <Text>{i18n.t("Confirm")}</Text>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { DeleteActionCell };
