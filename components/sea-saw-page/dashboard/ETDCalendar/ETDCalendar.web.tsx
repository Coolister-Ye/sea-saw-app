import { useCallback, useEffect, useMemo, useState } from "react";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useRouter } from "expo-router";
import { Tag as AntTag } from "antd";
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
      const dateStr = date.format("YYYY-MM-DD");
      const orders = data?.orders_by_date?.[dateStr] ?? [];
      const etaOrders = data?.orders_by_eta_date?.[dateStr] ?? [];
      return (
        <ETDCalendarCell orders={orders} etaOrders={etaOrders} onOrderClick={handleOrderClick} />
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
        <AntTag
          color="purple"
          style={{ border: "1px dashed #722ed1", background: "transparent", color: "#531dab" }}
        >
          ↓ 预计到货 (ETA)
        </AntTag>
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

      {/* ETA 预警列表 */}
      {(data?.eta_warning_list?.length ?? 0) > 0 && (
        <View border="default" rounded="lg" variant="card" className="p-4 gap-3">
          <Text size="sm" weight="semibold" className="text-purple-600">
            ETA 到货预警（14天内）
          </Text>
          <View className="flex-col gap-2">
            {data!.eta_warning_list.map((entry) => (
              <View
                key={`${entry.order_code}-${entry.outbound_code}`}
                className="flex-row items-center gap-3 px-3 py-2 rounded-md"
                style={{ backgroundColor: "rgba(114,46,209,0.04)", border: "1px dashed #d9b8f5" }}
              >
                <AntTag color="purple" style={{ flexShrink: 0, marginRight: 0 }}>
                  {entry.days_until_eta === 0 ? "今日到货" : `${entry.days_until_eta}天后`}
                </AntTag>
                <Text size="xs" weight="medium">{entry.order_code}</Text>
                <Text size="xs" className="text-gray-500">{entry.account_name}</Text>
                <View className="flex-1" />
                <Text size="xs" className="text-gray-400">ETA {entry.eta}</Text>
                <Text size="xs" className="text-gray-400">ETD {entry.etd}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
