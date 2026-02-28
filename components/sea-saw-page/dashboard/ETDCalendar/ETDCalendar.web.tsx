import { useCallback, useEffect, useMemo, useState } from "react";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useRouter } from "expo-router";
import useDataService from "@/hooks/useDataService";
import { useAuthStore } from "@/stores/authStore";
import i18n from "@/locale/i18n";
import { View } from "@/components/sea-saw-design/view";
import { Text } from "@/components/sea-saw-design/text";
import Tag from "@/components/sea-saw-design/tag";
import { MonthCalendar } from "@/components/sea-saw-design/calendar/MonthCalendar.web";
import { SummaryCard } from "@/components/sea-saw-page/base";
import { ETDCalendarCell } from "./ETDCalendarCell.web";
import {
  SUMMARY_CARDS,
  STATUS_LABEL,
  TAG_COLOR,
  type ETDCalendarData,
  type ShippingStatus,
} from "./types";

export function ETDCalendar() {
  const { request } = useDataService();
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const router = useRouter();

  const today = useMemo(() => dayjs(), []);
  const [year, setYear] = useState(today.year());
  const [month, setMonth] = useState(today.month() + 1); // 1-indexed
  const [data, setData] = useState<ETDCalendarData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!hasHydrated) return;
    setIsLoading(true);
    request({
      uri: "etdCalendar",
      method: "GET",
      params: { year, month },
    })
      .then((res) => setData(res ?? null))
      .catch(() => {})
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated, year, month]);

  const handleMonthChange = useCallback((y: number, m: number) => {
    setYear(y);
    setMonth(m);
  }, []);

  const handleOrderClick = useCallback(() => {
    router.push("/(app)/(pipeline)/pipeline");
  }, [router]);

  const renderCell = useCallback(
    (date: Dayjs) => {
      const orders = data?.orders_by_date?.[date.format("YYYY-MM-DD")] ?? [];
      return (
        <ETDCalendarCell orders={orders} onOrderClick={handleOrderClick} />
      );
    },
    [data, handleOrderClick],
  );

  const renderHeaderExtra = useCallback(
    () => (
      <View className="flex-row flex-wrap gap-2 items-center">
        {(Object.keys(STATUS_LABEL) as ShippingStatus[]).map((s) => (
          <Tag key={s} color={TAG_COLOR[s]} className="px-0.5">
            {STATUS_LABEL[s]}
          </Tag>
        ))}
      </View>
    ),
    [],
  );

  // ── Loading skeleton ────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <View className="p-4 gap-4">
        <View className="h-6 w-32 rounded bg-gray-100 dark:bg-gray-800" />
        <View className="flex-row gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <View
              key={i}
              className="flex-1 h-[88px] rounded-lg bg-gray-100 dark:bg-gray-800"
            />
          ))}
        </View>
        <View className="h-[580px] rounded-lg bg-gray-100 dark:bg-gray-800" />
      </View>
    );
  }

  return (
    <View className="p-4 gap-6">
      {/* Title */}
      <Text size="base" weight="semibold">
        {i18n.t("ETD Calendar")}
      </Text>

      {/* KPI summary cards */}
      <View className="flex-row flex-wrap gap-3">
        {SUMMARY_CARDS.map(({ label, key, colorClass }) => (
          <SummaryCard
            key={key}
            label={label}
            value={data?.summary[key] ?? 0}
            colorClass={colorClass}
          />
        ))}
      </View>

      {/* Calendar */}
      <View
        border="default"
        rounded="lg"
        className="overflow-hidden"
        variant="card"
      >
        <MonthCalendar
          year={year}
          month={month}
          onMonthChange={handleMonthChange}
          renderCell={renderCell}
          renderHeaderExtra={renderHeaderExtra}
          cellHeight={90}
        />
      </View>
    </View>
  );
}
