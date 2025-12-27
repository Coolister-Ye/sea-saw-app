import { View } from "react-native";
import { Text } from "@/components/ui/text";

export default function InputHeader({ title }: { title: string }) {
  return (
    <View className="flex flex-row justify-between items-center p-5 border-b border-gray-200 bg-white">
      <Text className="text-lg font-semibold">{title}</Text>
    </View>
  );
}

export { InputHeader };
