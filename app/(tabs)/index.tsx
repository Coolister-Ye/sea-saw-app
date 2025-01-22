import { Calendar } from "@/components/data/Calendar";
import Stats from "@/components/data/Stats";
import { useLocale } from "@/context/Locale";
import useDataService from "@/hooks/useDataService";
import { useEffect, useState } from "react";
import Text from "@/components/themed/Text";
import View from "@/components/themed/View";
import { ScrollView } from "react-native";
import { PlanList } from "@/components/data/PlanList";

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
  const { request } = useDataService();

  // State for storing statistics and order stats by month
  const [stats, setStats] = useState<StatItem[]>([]);
  const [orderStatByMonth, setOrderStatByMonth] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState<string>("");

  /**
   * Processes statistical data, calculating the percentage change between current and previous values.
   * @param name The name of the stat (e.g., "Contracts added")
   * @param current The current month's value
   * @param previous The previous month's value
   * @returns A formatted stat item or false if data is missing
   */
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

  /**
   * Fetches statistics for contracts and orders, and processes the data.
   */
  const getStatData = async () => {
    try {
      const [contractResponse, orderResponse] = await Promise.all([
        request("listContractsStats", "GET"),
        request("listOrdersStats", "GET"),
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

  /**
   * Fetches order stats by month and updates the state.
   * @param year The year for which to fetch data
   * @param month The month for which to fetch data
   */
  const getStatDataS2 = async (year?: string, month?: string) => {
    try {
      const params = year && month ? { date: `${year}-${month}` } : undefined;
      const response = await request(
        "listOrdersByMonth",
        "GET",
        undefined,
        params
      );
      setOrderStatByMonth(response.data);
    } catch (error) {
      console.error("Error loading statistics data:", error);
    }
  };

  /**
   * Handles month change in the calendar and fetches corresponding data.
   * @param month The new month selected in the calendar
   */
  const handleMonthChange = async (month: any) => {
    getStatDataS2(month.year, month.month);
  };

  /**
   * Renders the plan list based on the selected day.
   */
  const renderPlanList = () => {
    const plans = orderStatByMonth?.[selectedDay];
    return plans ? <PlanList plans={plans} posList={POSLIST} /> : null;
  };

  // Fetch initial data on component mount and when locale changes
  useEffect(() => {
    getStatData();
    getStatDataS2();
  }, [locale]);

  return (
    <ScrollView>
      <View style={{ flex: 1, alignItems: "center" }}>
        <View className="w-full p-3">
          {/* Stats section */}
          <View className="my-3">
            <Stats title={i18n.t("This month")} stats={stats} />
          </View>

          {/* Calendar and plans section */}
          <View className="p-3 w-full">
            <Text variant="primary" className="text-lg font-semibold mb-3">
              {i18n.t("Etd Plan")}
            </Text>
            <View className="p-3 rounded-md" variant="paper">
              {/* Calendar component */}
              <Calendar
                markedDates={orderStatByMonth}
                onMonthChange={handleMonthChange}
                onDayPress={(day: any) => setSelectedDay(day.dateString)} // Update selected day
              />
              {/* Render the plan list for the selected day */}
              {renderPlanList()}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
