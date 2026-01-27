import { Calendar } from "@/components/sea-saw-design/calendar";
import useDataService from "@/hooks/useDataService";
import { useEffect, useState } from "react";
import { Text } from "@/components/sea-saw-design/text";
import { View } from "@/components/sea-saw-design/view";
import { ScrollView } from "react-native";
import { PlanList } from "@/components/sea-saw-page/index/PlanList";
import { useRootNavigationState } from "expo-router";
import SwitchStats from "@/components/sea-saw-page/index/SwitchStats";
import { useAuthStore } from "@/stores/authStore";
import { useLocaleStore } from "@/stores/localeStore";
import i18n from "@/locale/i18n";

const POSLIST = ["已完成生产", "运输中", "支付中", "完成"];

export default function Index() {
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const isLocaleLoading = useLocaleStore((state) => state.isLoading);
  const isAppBaseReady = hasHydrated && !isLocaleLoading;
  const user = useAuthStore((state) => state.user);
  const locale = useLocaleStore((state) => state.locale);
  const { request } = useDataService();

  const [switchableStats, setSwitchableStats] = useState<any[]>([]);
  const [orderStatByMonth, setOrderStatByMonth] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState<string>("");
  const rootNavigationState = useRootNavigationState();
  const [isStatLoading, setStatLoading] = useState(true);

  const isAppReady = Boolean(rootNavigationState?.key && isAppBaseReady);

  // 过滤无效数据
  const filterValidStats = (name: string, statArray: any) => {
    return statArray && Array.isArray(statArray) && statArray.length > 0
      ? { name: i18n.t(name), statArray }
      : null;
  };

  // 获取合同和订单的统计数据
  const getStatData = async () => {
    setStatLoading(true);
    try {
      const [contractResponse, orderResponse] = await Promise.all([
        request({ uri: "listContractsStats", method: "GET" }),
        request({ uri: "listOrdersStats", method: "GET" }),
      ]);

      const stats = [
        filterValidStats(
          "Contracts Count by Month",
          contractResponse.data?.contracts_count_by_month,
        ),
        filterValidStats(
          "Contracts Count by Year",
          contractResponse.data?.contracts_count_by_year,
        ),
        filterValidStats(
          "Orders Count by Month",
          orderResponse.data?.orders_count_by_month,
        ),
        filterValidStats(
          "Orders Count by Year",
          orderResponse.data?.orders_count_by_year,
        ),
        filterValidStats(
          "Orders Received by Month",
          orderResponse.data?.orders_received_by_month,
        ),
        filterValidStats(
          "Orders Received by Year",
          orderResponse.data?.orders_received_by_year,
        ),
        filterValidStats(
          "Orders Receivable by Year",
          orderResponse.data?.orders_receivable_by_year,
        ),
        filterValidStats(
          "Orders Total Amount by Year",
          orderResponse.data?.orders_total_amount_by_year,
        ),
        filterValidStats(
          "Orders Total Amount by Month",
          orderResponse.data?.orders_total_amount_by_month,
        ),
      ].filter(Boolean); // 过滤掉 null 值

      setSwitchableStats(stats);
    } catch (error) {
      console.error("Error loading statistics data:", error);
    } finally {
      setStatLoading(false);
    }
  };

  // 获取指定月份的订单数据
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
      console.error("Error loading orders by month:", error);
    }
  };

  // 处理月份变化
  const handleMonthChange = async (
    month: { year: string; month: string } | null,
  ) => {
    if (!month) return;
    await getStatDataS2(month.year, month.month);
  };

  // 渲染计划列表
  const renderPlanList = () => {
    return orderStatByMonth?.[selectedDay] ? (
      <PlanList plans={orderStatByMonth[selectedDay]} posList={POSLIST} />
    ) : null;
  };

  useEffect(() => {
    if (isAppReady) {
      getStatData();
      getStatDataS2();
    }
  }, [isAppReady, locale, user]);

  return (
    <ScrollView>
      <View style={{ flex: 1, alignItems: "center" }}>
        <View className="w-full p-1 md:p-3">
          <View className="my-3">
            <SwitchStats
              title={i18n.t("This month")}
              stats={switchableStats}
              isLoading={isStatLoading}
            />
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
