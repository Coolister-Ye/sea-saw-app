import React from "react";
import View from "../themed/View";
import Text from "../themed/Text";
import SwitchStatCard from "./SwitchStatCard";
import { ActivityIndicator } from "react-native";

type StatsProps = {
  title: string;
  stats: {
    name: string;
    statArray: {
      total: string | number;
      date: string;
    }[];
  }[];
  isLoading: boolean;
};

export default function SwitchStats({ title, stats, isLoading }: StatsProps) {
  return (
    <View className="p-3 w-full rounded-md">
      <Text variant="primary" className="text-lg font-semibold">
        {title}
      </Text>
      {isLoading ? (
        <View className="animate-pulse w-full h-36 items-center justify-center mt-5">
          <ActivityIndicator />
        </View>
      ) : (
        <View className="mt-5 flex flex-row flex-wrap justify-between">
          {stats.map((item: any) => (
            <SwitchStatCard
              key={item.name}
              name={item.name}
              statArray={item.statArray}
            />
          ))}
        </View>
      )}
    </View>
  );
}
