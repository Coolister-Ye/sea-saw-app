import { useCallback, useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";
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
import { ShippingCalendarCell } from "./ShippingCalendarCell.web";
import {
  SUMMARY_CARDS,
  ETA_SUMMARY_CARDS,
  STATUS_LABEL,
  TAG_COLOR,
  ETA_TAG_COLOR,
  ETA_STATUS_LABEL,
  type ShippingCalendarData,
  type ShippingStatus,
  type EtaStatus,
} from "./types";

type CalendarView = "etd" | "eta";

export function ShippingCalendar() {
  const { request } = useDataService();
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const router = useRouter();

  const [year, setYear] = useState(() => dayjs().year());
  const [month, setMonth] = useState(() => dayjs().month() + 1); // 1-indexed
  const [data, setData] = useState<ShippingCalendarData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [calendarView, setCalendarView] = useState<CalendarView>("etd");

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

  // ── Calendar cell ────────────────────────────────────────────────────────────
  const renderCell = useCallback(
    (date: Dayjs) => {
      const dateStr = date.format("YYYY-MM-DD");
      const orders =
        calendarView === "etd"
          ? (data?.etd.orders_by_date?.[dateStr] ?? [])
          : [];
      const etaOrders =
        calendarView === "eta"
          ? (data?.eta.orders_by_date?.[dateStr] ?? [])
          : [];
      return (
        <ShippingCalendarCell
          orders={orders}
          etaOrders={etaOrders}
          onOrderClick={handleOrderClick}
        />
      );
    },
    [data, handleOrderClick, calendarView],
  );

  // ── Legend ───────────────────────────────────────────────────────────────────
  const renderHeaderExtra = useCallback(() => {
    if (calendarView === "etd") {
      return (
        <View className="flex-row flex-wrap gap-2 items-center">
          {(Object.keys(STATUS_LABEL) as ShippingStatus[]).map((s) => (
            <Tag key={s} color={TAG_COLOR[s]} className="px-0.5">
              {i18n.t(STATUS_LABEL[s])}
            </Tag>
          ))}
        </View>
      );
    }
    return (
      <View className="flex-row flex-wrap gap-2 items-center">
        {(Object.keys(ETA_STATUS_LABEL) as EtaStatus[]).map((s) => (
          <Tag key={s} color={ETA_TAG_COLOR[s].badge as any} className="px-0.5">
            {i18n.t(ETA_STATUS_LABEL[s])}
          </Tag>
        ))}
      </View>
    );
  }, [calendarView]);

  // ── Loading skeleton ─────────────────────────────────────────────────────────
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

  const isEtd = calendarView === "etd";

  return (
    <View className="p-4 gap-6">
      {/* Title + view toggle */}
      <View className="flex-row items-center justify-between">
        <Text size="base" weight="semibold">
          {i18n.t(isEtd ? "ETD Shipping Calendar" : "ETA Arrival Calendar")}
        </Text>
        <View className="flex-row bg-muted rounded-full p-0.5">
          {(["etd", "eta"] as CalendarView[]).map((view) => {
            const active = calendarView === view;
            return (
              <TouchableOpacity
                key={view}
                onPress={() => setCalendarView(view)}
                activeOpacity={0.8}
                className={`px-3 py-1 rounded-full ${active ? "bg-card shadow-sm" : ""}`}
              >
                <Text
                  size="xs"
                  weight={active ? "medium" : "normal"}
                  className={active ? "" : "text-foreground/50"}
                >
                  {view === "etd" ? i18n.t("ETD Shipping") : i18n.t("ETA Arrival")}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Summary cards */}
      <View className="flex-row flex-wrap gap-3">
        {isEtd
          ? SUMMARY_CARDS.map(({ label, key, colorClass }) => (
              <SummaryCard
                key={key}
                label={i18n.t(label)}
                value={data?.etd.summary[key] ?? 0}
                colorClass={colorClass}
              />
            ))
          : ETA_SUMMARY_CARDS.map(({ label, key, colorClass }) => (
              <SummaryCard
                key={key}
                label={i18n.t(label)}
                value={data?.eta.summary[key] ?? 0}
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
