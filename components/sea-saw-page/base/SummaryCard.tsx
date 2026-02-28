import { View } from "@/components/sea-saw-design/view";
import { Text } from "@/components/sea-saw-design/text";

type SummaryCardProps = {
  label: string;
  value: number;
  colorClass: string;
};

export default function SummaryCard({
  label,
  value,
  colorClass,
}: SummaryCardProps) {
  return (
    <View
      variant="card"
      border="default"
      rounded="lg"
      className="flex-1 min-w-[100px] p-4 items-center"
    >
      <Text className={`text-2xl font-bold ${colorClass}`}>{value}</Text>
      <Text variant="secondary" size="xs">
        {label}
      </Text>
    </View>
  );
}
