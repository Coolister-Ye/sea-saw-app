import { Calendar } from "@/components/sea-saw-design/calendar";
import { useState, useEffect, useMemo } from "react";
import { Text } from "@/components/sea-saw-design/text";
import { View } from "@/components/sea-saw-design/view";
import { ScrollView } from "react-native";
import { PlanList } from "@/components/sea-saw-page/index/PlanList";
import { OverviewStats } from "@/components/sea-saw-page/dashboard/overview";
import i18n from "@/locale/i18n";
import useDataService from "@/hooks/useDataService";

type CalendarPlan = {
  order_code: string;
  stage: string | null | undefined;
  owner: string | null | undefined;
};
type CalendarMarkedDates = Record<string, CalendarPlan[]>;

const POSLIST = ["已完成生产", "运输中", "支付中", "完成"];

export default function Index() {
  const { getViewSet } = useDataService();
  const calendarViewSet = useMemo(() => getViewSet("etdCalendar"), [getViewSet]);

  const [orderStatByMonth, setOrderStatByMonth] = useState<CalendarMarkedDates | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>("");

  useEffect(() => {
    calendarViewSet.list().then((res: any) => {
      setOrderStatByMonth(res?.data ?? res ?? null);
    });
  }, [calendarViewSet]);

  return (
    <ScrollView>
      <View style={{ flex: 1, alignItems: "center" }}>
        <View className="w-full p-1 md:p-3">
          <View className="my-3">
            <OverviewStats />
          </View>

          <View className="p-3 w-full">
            <Text variant="primary" className="text-lg font-semibold mb-3">
              {i18n.t("Etd Plan")}
            </Text>
            <View className="p-3 rounded-md" variant="paper">
              <Calendar
                markedDates={orderStatByMonth}
                onDayPress={(day: { dateString: string }) => setSelectedDay(day.dateString)}
              />
              {orderStatByMonth?.[selectedDay] && (
                <PlanList
                  plans={orderStatByMonth[selectedDay]}
                  posList={POSLIST}
                />
              )}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
