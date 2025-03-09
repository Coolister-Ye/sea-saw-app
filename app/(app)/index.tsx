import { Calendar } from "@/components/data/Calendar";
import Stats from "@/components/data/Stats";
import { useLocale } from "@/context/Locale";
import useDataService from "@/hooks/useDataService";
import { useEffect, useState } from "react";
import Text from "@/components/themed/Text";
import View from "@/components/themed/View";
import { ScrollView, ActivityIndicator } from "react-native";
import { PlanList } from "@/components/data/PlanList";
import { useRootNavigationState } from "expo-router";

type StatItem = {
  name: string;
  stat: string;
  previousStat: string;
  change: string;
  changeType: "increase" | "decrease";
};

const POSLIST = ["已完成生产", "运输中", "支付中", "完成"];

export default function Index() {
  const { locale, i18n } = useLocale();
  const { request, loading } = useDataService(); // Destructure loading directly from useDataService

  const [stats, setStats] = useState<StatItem[]>([]);
  const [orderStatByMonth, setOrderStatByMonth] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState<string>("");
  const rootNavigationState = useRootNavigationState();

  const processStatData = (
    name: string,
    current?: number,
    previous?: number
  ): StatItem | false => {
    if (current === undefined || previous === undefined) return false;

    const change = ((current - previous) / previous) * 100;
    return {
      name: i18n.t(name),
      stat: current.toFixed(2),
      previousStat: previous.toFixed(2),
      change: Number.isFinite(change)
        ? `${change.toFixed(2)}%`
        : change.toString(),
      changeType: current >= previous ? "increase" : "decrease",
    };
  };

  const getStatData = async () => {
    try {
      const [contractResponse, orderResponse] = await Promise.all([
        request({ uri: "listContractsStats", method: "GET" }),
        request({ uri: "listOrdersStats", method: "GET" }),
      ]);

      const rawStats = [
        processStatData(
          "Contracts added",
          contractResponse.data.contracts_this_month_count,
          contractResponse.data.contracts_last_month_count
        ),
        processStatData(
          "Orders added",
          orderResponse.data.orders_this_month_count,
          orderResponse.data.orders_last_month_count
        ),
        processStatData(
          "Income",
          orderResponse.data.orders_this_month_income,
          orderResponse.data.orders_last_month_income
        ),
      ];

      const validStats = rawStats.filter(Boolean) as StatItem[];
      setStats(validStats);
    } catch (error) {
      console.error("Error loading statistics data:", error);
    }
  };

  const getStatDataS2 = async (year?: string, month?: string) => {
    try {
      const params = year && month ? { date: `${year}-${month}` } : undefined;
      const response = await request({
        uri: "listOrdersByMonth",
        method: "GET",
        params,
      });
      setOrderStatByMonth(response.data);
    } catch (error) {
      console.error("Error loading statistics data:", error);
    }
  };

  const handleMonthChange = async (month: any) => {
    getStatDataS2(month.year, month.month);
  };

  const renderPlanList = () => {
    const plans = orderStatByMonth?.[selectedDay];
    return plans ? <PlanList plans={plans} posList={POSLIST} /> : null;
  };

  useEffect(() => {
    if (rootNavigationState?.key) {
      getStatData();
      getStatDataS2();
    }
  }, []);

  return (
    <ScrollView>
      <View style={{ flex: 1, alignItems: "center" }}>
        <View className="w-full p-3">
          <View className="my-3">
            <Stats title={i18n.t("This month")} stats={stats} />
          </View>

          <View className="p-3 w-full">
            <Text variant="primary" className="text-lg font-semibold mb-3">
              {i18n.t("Etd Plan")}
            </Text>
            <View className="p-3 rounded-md" variant="paper">
              <Calendar
                markedDates={orderStatByMonth}
                onMonthChange={handleMonthChange}
                onDayPress={(day: any) => setSelectedDay(day.dateString)}
              />
              {renderPlanList()}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
