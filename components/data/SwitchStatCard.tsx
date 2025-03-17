import { useState } from "react";
import clsx from "clsx";
import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/20/solid";
import View from "../themed/View";
import Text from "../themed/Text";
import Select from "../themed/Select";

type SwitchStatCardProps = {
  name: string;
  statArray: {
    total: string | number;
    date: string;
  }[];
};

export default function SwitchStatCard({
  name,
  statArray,
}: SwitchStatCardProps) {
  // 复制 & 排序数据，避免影响原始 `statArray`
  const sortedStatArray = [...statArray].sort((a, b) =>
    a.date > b.date ? 1 : -1
  );

  // 计算变化率
  const processedStatArray = sortedStatArray.map((item, index) => {
    const previousTotal = parseFloat(
      sortedStatArray[index - 1]?.total.toString()
    );
    const currentTotal = parseFloat(item.total.toString());
    const change = ((currentTotal - previousTotal) / previousTotal) * 100;

    return {
      ...item,
      previousTotal: previousTotal.toFixed(2),
      change: Number.isFinite(change) ? `${change.toFixed(2)}%` : change,
      changeType: currentTotal >= previousTotal ? "increase" : "decrease",
    };
  });

  // 下拉选项
  const dateOptions = processedStatArray.map((item) => ({
    value: item.date,
    label: item.date,
  }));

  // 选中状态
  const [showStat, setShowStat] = useState<number | null>(
    processedStatArray.length - 1
  );
  const currentStat =
    showStat !== null ? processedStatArray[showStat] : processedStatArray[0];

  return (
    <View
      variant="paper"
      className="w-full md:w-[49%] px-4 py-5 rounded-md mb-3"
    >
      {/* 标题 & 下拉选择 */}
      <View className="flex flex-row items-center justify-between">
        <Text variant="primary" className="text-base font-normal">
          {name}
        </Text>
        <Select
          options={dateOptions}
          onChange={(value) => {
            const index = dateOptions.findIndex(
              (option) => option.value === value
            );
            setShowStat(index);
          }}
          className="bg-white"
          variant="borderless"
          defaultValue={dateOptions[showStat || 0]}
        />
      </View>

      {/* 数据展示 */}
      <View className="mt-1 flex items-baseline justify-between">
        {/* 当前总量 */}
        <View className="flex flex-row items-baseline">
          <Text className="text-2xl font-semibold text-indigo-600">
            {currentStat.total}
          </Text>
          <Text variant="secondary" className="ml-2 text-sm font-medium">
            from {currentStat.previousTotal.toString()}
          </Text>
        </View>

        {/* 变化趋势 */}
        <View
          className={clsx(
            "flex flex-row items-center rounded-full px-2.5 py-0.5 text-sm font-medium mt-2",
            currentStat.changeType === "increase"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          )}
        >
          {currentStat.changeType === "increase" ? (
            <ArrowUpIcon className="w-4 h-4 mr-1 text-green-500" />
          ) : (
            <ArrowDownIcon className="w-4 h-4 mr-1 text-red-500" />
          )}
          <Text className="sr-only">
            {currentStat.changeType === "increase" ? "Increased" : "Decreased"}{" "}
            by
          </Text>
          <Text
            className={clsx(
              currentStat.changeType === "increase"
                ? "text-green-800"
                : "text-red-800"
            )}
          >
            {currentStat.change.toString()}
          </Text>
        </View>
      </View>
    </View>
  );
}
