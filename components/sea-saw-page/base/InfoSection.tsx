import { View } from "react-native";
import { Text } from "@/components/sea-saw-design/text";

/**
 * InfoSection Component
 * Displays a titled section with white background and border
 */
function InfoSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <View
      className={`bg-white p-3 rounded border border-gray-200 mb-3 ${className ?? ""}`}
    >
      <Text className="text-xs font-semibold text-gray-700 mb-2">{title}</Text>
      {children}
    </View>
  );
}

export default InfoSection;
export { InfoSection };
