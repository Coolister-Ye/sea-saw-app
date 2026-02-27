import { useState } from "react";
import { View } from "@/components/sea-saw-design/view";
import { Text } from "@/components/sea-saw-design/text";
import { SparkLineChart } from "@mui/x-charts/SparkLineChart";
import {
  areaElementClasses,
  lineElementClasses,
} from "@mui/x-charts/LineChart";
import { chartsAxisHighlightClasses } from "@mui/x-charts/ChartsAxisHighlight";

type StatItem = { date: string; total: string | number };

type SparkCardProps = {
  name: string;
  statArray: StatItem[];
};

const ACCENT = "rgb(59, 130, 246)"; // blue-500
const ACCENT_SUBTLE = "rgba(99, 102, 241, 0.2)";
const CHART_WIDTH = 140;
const CHART_HEIGHT = 64;

export function SparkCard({ name, statArray }: SparkCardProps) {
  const sorted = [...statArray].sort((a, b) => (a.date > b.date ? 1 : -1));
  const values = sorted.map((d) => Number(d.total));
  const dates = sorted.map((d) => d.date);

  const [highlightIndex, setHighlightIndex] = useState<number | null>(null);
  const idx = highlightIndex ?? values.length - 1;

  const displayValue = values[idx];
  const displayDate = dates[idx];

  const prev = values[idx - 1];
  const delta =
    prev != null && prev !== 0 ? ((displayValue - prev) / prev) * 100 : null;

  const isPositive = delta === null || delta >= 0;

  const formattedValue =
    typeof displayValue === "number"
      ? displayValue % 1 === 0
        ? displayValue.toLocaleString()
        : displayValue.toLocaleString(undefined, { maximumFractionDigits: 2 })
      : displayValue;

  return (
    <View
      variant="card"
      border="default"
      rounded="lg"
      className="min-w-0 overflow-hidden"
    >
      <View className="flex-row items-center p-4 gap-3">
        {/* Left: stats */}
        <View className="flex-1 gap-1.5">
          <Text
            variant="secondary"
            size="xs"
            weight="medium"
            className="uppercase tracking-wider"
          >
            {name}
          </Text>

          <View className="flex-row items-center gap-2">
            <Text
              variant="primary"
              size="2xl"
              weight="bold"
              className="leading-none"
            >
              {formattedValue}
            </Text>
            {delta !== null && (
              <View
                className={
                  isPositive
                    ? "rounded-full px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950"
                    : "rounded-full px-2 py-0.5 bg-red-50 dark:bg-red-950"
                }
              >
                <Text
                  size="xs"
                  weight="semibold"
                  className={
                    isPositive
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }
                >
                  {isPositive ? "▲ " : "▼ "}
                  {Math.abs(delta).toFixed(1)}%
                </Text>
              </View>
            )}
          </View>

          <Text variant="muted" size="xs">
            {displayDate}
          </Text>
        </View>

        {/* Right: chart */}
        <View style={{ borderColor: ACCENT_SUBTLE }}>
          <SparkLineChart
            data={values}
            xAxis={{ id: "date-axis", data: dates }}
            height={CHART_HEIGHT}
            width={CHART_WIDTH}
            area
            showHighlight
            color={ACCENT}
            onHighlightedAxisChange={(axisItems) => {
              setHighlightIndex(axisItems[0]?.dataIndex ?? null);
            }}
            highlightedAxis={
              highlightIndex === null
                ? []
                : [{ axisId: "date-axis", dataIndex: highlightIndex }]
            }
            baseline="min"
            margin={{ bottom: 0, top: 6, left: 6, right: 6 }}
            yAxis={{
              domainLimit: (_: number, maxValue: number) => ({
                min: -maxValue / 8,
                max: maxValue,
              }),
            }}
            sx={{
              [`& .${areaElementClasses.root}`]: { opacity: 0.15 },
              [`& .${lineElementClasses.root}`]: { strokeWidth: 2 },
              [`& .${chartsAxisHighlightClasses.root}`]: {
                stroke: ACCENT,
                strokeDasharray: "none",
                strokeWidth: 1.5,
              },
            }}
            slotProps={{ lineHighlight: { r: 3 } }}
            clipAreaOffset={{ top: 2, bottom: 2 }}
            axisHighlight={{ x: "line" }}
          />
        </View>
      </View>
    </View>
  );
}
