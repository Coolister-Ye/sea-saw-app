import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import React from "react";
import View from "../../themed/View";
import Text from "../../themed/Text";

type StatsProps = {
  title: string;
  stats: {
    name: string;
    stat: string;
    previousStat: string;
    change: string;
    changeType: string;
  }[];
};

export default function Stats({ title, stats }: StatsProps) {
  if (stats.length === 0) return null;
  return (
    <View className="p-3 w-full rounded-md">
      <Text variant="primary" className="text-lg font-semibold">
        {title}
      </Text>
      <View className="mt-5 flex flex-row flex-wrap justify-between">
        {stats.map((item: any) => (
          <View
            variant="paper"
            key={item.name}
            className="w-full md:w-[49%] px-4 py-5 rounded-md mb-3"
          >
            <Text variant="primary" className="text-base font-normal">
              {item.name}
            </Text>
            <View className="mt-1 flex items-baseline justify-between">
              <View className="flex flex-row items-baseline">
                <Text className="text-2xl font-semibold text-indigo-600">
                  {item.stat}
                </Text>
                <Text variant="secondary" className="ml-2 text-sm font-medium">
                  from {item.previousStat}
                </Text>
              </View>

              <View
                className={clsx(
                  "flex flex-row items-center rounded-full px-2.5 py-0.5 text-sm font-medium mt-2",
                  item.changeType === "increase"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                )}
              >
                {item.changeType === "increase" ? (
                  <ArrowUpIcon className="w-4 h-4 mr-1 text-green-500" />
                ) : (
                  <ArrowDownIcon className="w-4 h-4 mr-1 text-red-500" />
                )}

                <Text className="sr-only">
                  {item.changeType === "increase" ? "Increased" : "Decreased"}{" "}
                  by
                </Text>
                <Text
                  className={clsx(
                    item.changeType === "increase"
                      ? "text-green-800"
                      : "text-red-800"
                  )}
                >
                  {item.change}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
