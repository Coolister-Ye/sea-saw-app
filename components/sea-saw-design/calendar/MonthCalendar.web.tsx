import { useMemo } from "react";
import { Pressable } from "react-native";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { HolidayUtil, Lunar } from "lunar-typescript";
import { View } from "@/components/sea-saw-design/view";
import { Text } from "@/components/sea-saw-design/text";
import { ChevronLeft } from "@/components/sea-saw-design/icons/ChevronLeft";
import { ChevronRight } from "@/components/sea-saw-design/icons/ChevronRight";
import i18n from "@/locale/i18n";
import { useLocaleStore } from "@/stores/localeStore";

// ── Helpers ────────────────────────────────────────────────────────────────────

const WEEK_KEYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

/** Build 42 cells (6 rows × 7 cols) starting from the Sunday before month start */
function buildCalendarDays(year: number, month: number): Dayjs[] {
  const first = dayjs().year(year).month(month - 1).date(1);
  const start = first.subtract(first.day(), "day"); // back to Sunday
  return Array.from({ length: 42 }, (_, i) => start.add(i, "day"));
}

/** Priority: holiday name > solar term > lunar day */
function getLunarInfo(date: Dayjs): { text: string; isSpecial: boolean } {
  const lunar = Lunar.fromDate(date.toDate());
  const solarTerm = lunar.getJieQi();
  const h = HolidayUtil.getHoliday(date.year(), date.month() + 1, date.date());
  const holidayName = h?.getTarget() === h?.getDay() ? h?.getName() : undefined;
  return {
    text: holidayName || solarTerm || lunar.getDayInChinese(),
    isSpecial: !!(holidayName || solarTerm),
  };
}

// ── Types ──────────────────────────────────────────────────────────────────────

export interface MonthCalendarProps {
  year: number;
  /** 1-indexed month (1–12) */
  month: number;
  onMonthChange: (year: number, month: number) => void;
  /**
   * Render extra content inside each date cell (below the date/lunar row).
   * Return null/undefined for empty cells.
   */
  renderCell?: (date: Dayjs, isCurrentMonth: boolean) => React.ReactNode;
  /** Cell height in px. Default: 90 */
  cellHeight?: number;
  /** Optional extra row rendered below the title/nav row, inside the header border */
  renderHeaderExtra?: () => React.ReactNode;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function MonthCalendar({
  year,
  month,
  onMonthChange,
  renderCell,
  cellHeight = 90,
  renderHeaderExtra,
}: MonthCalendarProps) {
  const { locale } = useLocaleStore();
  const isZh = locale === "zh";

  const today = useMemo(() => dayjs(), []);

  const weekLabels = useMemo(
    () => WEEK_KEYS.map((k) => i18n.t(k)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale],
  );

  const weeks = useMemo<Dayjs[][]>(() => {
    const days = buildCalendarDays(year, month);
    return Array.from({ length: 6 }, (_, i) => days.slice(i * 7, i * 7 + 7));
  }, [year, month]);

  const headerTitle = useMemo(() => {
    if (isZh) return `${year}年 ${String(month).padStart(2, "0")}月`;
    return dayjs().year(year).month(month - 1).format("MMMM YYYY");
  }, [year, month, isZh]);

  const lunarHeader = useMemo(() => {
    if (!isZh) return null;
    const lunar = Lunar.fromDate(new Date(year, month - 1, 1));
    return `${lunar.getYearInChinese()}（${lunar.getYearShengXiao()}）年 · ${lunar.getMonthInChinese()}月`;
  }, [year, month, isZh]);

  const goToPrev = () => {
    if (month === 1) onMonthChange(year - 1, 12);
    else onMonthChange(year, month - 1);
  };

  const goToNext = () => {
    if (month === 12) onMonthChange(year + 1, 1);
    else onMonthChange(year, month + 1);
  };

  return (
    <View className="w-full">
      {/* ── Header ── */}
      <View className="px-4 py-3 border-b border-border dark:border-dark-border gap-2">
        <View className="flex-row items-center justify-between">
          <View className="gap-0.5">
            <Text size="base" weight="semibold">
              {headerTitle}
            </Text>
            {lunarHeader && (
              <Text variant="secondary" size="xs">
                {lunarHeader}
              </Text>
            )}
          </View>
          <View className="flex-row items-center gap-1">
            <Pressable
              onPress={goToPrev}
              className="p-2 rounded-md web:hover:bg-gray-100 dark:web:hover:bg-gray-800 active:opacity-60"
              accessibilityLabel={i18n.t("Previous month")}
            >
              <ChevronLeft size={16} color="#888" />
            </Pressable>
            <Pressable
              onPress={goToNext}
              className="p-2 rounded-md web:hover:bg-gray-100 dark:web:hover:bg-gray-800 active:opacity-60"
              accessibilityLabel={i18n.t("Next month")}
            >
              <ChevronRight size={16} color="#888" />
            </Pressable>
          </View>
        </View>
        {renderHeaderExtra?.()}
      </View>

      {/* ── Week-day labels ── */}
      <View className="flex-row bg-muted dark:bg-dark-muted border-b border-border dark:border-dark-border">
        {weekLabels.map((label, i) => (
          <View key={i} className="flex-1 items-center py-2">
            <Text
              size="xs"
              variant="secondary"
              className={i === 0 || i === 6 ? "text-red-400" : ""}
            >
              {label}
            </Text>
          </View>
        ))}
      </View>

      {/* ── Calendar grid ── */}
      <View>
        {weeks.map((week, wi) => (
          <View
            key={wi}
            className="flex-row"
            style={{
              borderBottomWidth: wi < 5 ? 1 : 0,
              borderBottomColor: "rgba(5,5,5,0.06)",
            }}
          >
            {week.map((date, di) => {
              const isCurrentMonth = date.month() === month - 1;
              const isToday = date.isSame(today, "date");
              const isWeekend = date.day() === 0 || date.day() === 6;
              const lunarInfo = isZh ? getLunarInfo(date) : null;

              return (
                <View
                  key={date.format("YYYY-MM-DD")}
                  style={{
                    flex: 1,
                    height: cellHeight,
                    overflow: "hidden",
                    borderRightWidth: di < 6 ? 1 : 0,
                    borderRightColor: "rgba(5,5,5,0.06)",
                  }}
                >
                  {/* Today: 2 px blue top bar */}
                  <View
                    style={{
                      height: 2,
                      backgroundColor: isToday ? "#1677ff" : "transparent",
                    }}
                  />

                  {/* Cell body */}
                  <View
                    style={{
                      flex: 1,
                      padding: 4,
                      overflowX: "hidden",
                      opacity: isCurrentMonth ? 1 : 0.3,
                    }}
                  >
                    {/* Date number + lunar text (zh only) */}
                    <View
                      className="flex-row justify-between items-baseline mb-1"
                      style={{ flexShrink: 0 }}
                    >
                      <Text
                        size="sm"
                        style={{
                          fontWeight: isToday ? "600" : "400",
                          color: isToday
                            ? "#1677ff"
                            : isWeekend
                              ? "#ff4d4f"
                              : undefined,
                          lineHeight: 16,
                        }}
                      >
                        {date.date()}
                      </Text>
                      {lunarInfo && (
                        <Text
                          numberOfLines={1}
                          style={{
                            fontSize: 10,
                            lineHeight: 14,
                            maxWidth: "62%",
                            color: lunarInfo.isSpecial
                              ? "#1677ff"
                              : "rgba(0,0,0,0.2)",
                          }}
                        >
                          {lunarInfo.text}
                        </Text>
                      )}
                    </View>

                    {/* Custom content slot */}
                    <View style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                      {renderCell?.(date, isCurrentMonth)}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}
