import { View } from "react-native";
import { Text } from "@/components/ui/text";

/* ========================
 * Section 组件
 * ======================== */
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-6">
      <Text className="text-sm font-semibold mb-2">{title}</Text>
      <View className="mb-4 border border-gray-100 rounded-lg overflow-hidden">
        {children}
      </View>
    </View>
  );
}

export default Section;
export { Section };
