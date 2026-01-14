import { View } from "react-native";
import { Text } from "@/components/ui/text";

/**
 * InfoSection Component
 * Displays a titled section with white background and border
 */
function InfoSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="bg-white p-3 rounded border border-gray-200 mb-3">
      <Text className="text-xs font-semibold text-gray-700 mb-2">{title}</Text>
      {children}
    </View>
  );
}

export default InfoSection;
export { InfoSection };
