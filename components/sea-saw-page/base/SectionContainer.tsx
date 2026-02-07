import { cn } from "@/lib/utils";
import { View } from "react-native";
import { Text } from "@/components/sea-saw-design/text";

/* ========================
 * SectionContainer 组件
 * ======================== */
function SectionContainer({
  title,
  children,
  className,
  titleClassName,
  contentClassName,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
  contentClassName?: string;
}) {
  return (
    <View className={cn("mb-6", className)}>
      {title && (
        <Text className={cn("text-sm font-semibold mb-3", titleClassName)}>
          {title}
        </Text>
      )}
      <View
        className={cn(
          "mb-4 border border-gray-100 rounded-lg overflow-hidden",
          contentClassName,
        )}
      >
        {children}
      </View>
    </View>
  );
}

export default SectionContainer;
export { SectionContainer };
