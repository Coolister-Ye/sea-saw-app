import { useEffect, useMemo, useState } from "react";
import useDataService from "@/hooks/useDataService";
import SwitchStats from "@/components/sea-saw-page/index/SwitchStats";
import i18n from "@/locale/i18n";
import { useLocaleStore } from "@/stores/localeStore";
import { useAuthStore } from "@/stores/authStore";

type StatItem = { date: string; total: string | number };

type OverviewData = {
  orders_count_by_month?: StatItem[];
  orders_count_by_year?: StatItem[];
  orders_received_by_month?: StatItem[];
  orders_total_amount_by_month?: StatItem[];
  orders_total_amount_by_year?: StatItem[];
};

const STAT_FIELDS: { key: keyof OverviewData; labelKey: string }[] = [
  { key: "orders_count_by_month", labelKey: "Orders Count by Month" },
  { key: "orders_count_by_year", labelKey: "Orders Count by Year" },
  { key: "orders_received_by_month", labelKey: "Orders Received by Month" },
  { key: "orders_total_amount_by_month", labelKey: "Orders Total Amount by Month" },
  { key: "orders_total_amount_by_year", labelKey: "Orders Total Amount by Year" },
];

export function OverviewStats() {
  const { request } = useDataService();
  const locale = useLocaleStore((state) => state.locale);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const [data, setData] = useState<OverviewData>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!hasHydrated) return;
    setIsLoading(true);
    request({ uri: "overviewStats", method: "GET" })
      .then((res) => setData(res ?? {}))
      .catch(() => {})
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated]);

  const stats = useMemo(
    () =>
      STAT_FIELDS.filter(({ key }) => (data[key]?.length ?? 0) > 0).map(
        ({ key, labelKey }) => ({
          name: i18n.t(labelKey),
          statArray: data[key]!,
        }),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, locale],
  );

  return (
    <SwitchStats
      title={i18n.t("Overview")}
      stats={stats}
      isLoading={isLoading}
    />
  );
}
