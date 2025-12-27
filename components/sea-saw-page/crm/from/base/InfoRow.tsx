import { View, Text } from "react-native";

function InfoRow({ icon, text }: { icon: string; text: string }) {
  return (
    <View className="flex flex-row items-center gap-2">
      <Text className="text-xs">{icon}</Text>
      <Text className="text-xs text-gray-700 truncate" numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

export default InfoRow;
export { InfoRow };
