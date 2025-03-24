import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  SectionList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Linking,
} from "react-native";
import { getBaseUrl } from "@/utlis/webHelper";
import { useLocale } from "@/context/Locale";
import useDataService from "@/hooks/useDataService";
import Divider from "@/components/sea-saw-design/divider";
import { ArrowDownCircleIcon } from "react-native-heroicons/solid";

type DownloadTask = {
  pk: number;
  task_id: string;
  file_name: string;
  download_url: string;
  status: string;
  created_at: string;
};

type SectionData = {
  title: string;
  data: DownloadTask[];
};

const PAGE_SIZE = 50;

const formatDate = (dateString: string) => {
  return new Date(dateString).toISOString().split("T")[0]; // 仅保留日期
};

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toISOString().split("T")[1].split(".")[0]; // 仅保留时分秒
};

export default function DownloadScreen() {
  const { i18n } = useLocale();
  const { request } = useDataService();
  const [sections, setSections] = useState<SectionData[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchTasks = useCallback(
    async (pageNum: number, isRefresh = false) => {
      if (loading) return;
      setLoading(true);

      try {
        const response = await request({
          uri: "listDownloads",
          method: "GET",
          params: {
            page: pageNum,
            page_size: PAGE_SIZE,
            ordering: "-created_at",
          },
        });

        const fetchedTasks: DownloadTask[] = response.data.results.sort(
          (
            a: { created_at: string | number | Date },
            b: { created_at: string | number | Date }
          ) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        const groupedTasks = fetchedTasks.reduce<
          Record<string, DownloadTask[]>
        >((acc, task) => {
          const dateKey = formatDate(task.created_at);
          if (!acc[dateKey]) acc[dateKey] = [];
          acc[dateKey].push(task);
          return acc;
        }, {});

        const newSections = Object.entries(groupedTasks).map(
          ([title, data]) => ({
            title,
            data,
          })
        );

        setSections((prev) =>
          isRefresh
            ? newSections
            : [...prev, ...newSections].reduce<SectionData[]>((acc, sec) => {
                const existing = acc.find((s) => s.title === sec.title);
                if (existing) {
                  existing.data = [...existing.data, ...sec.data];
                } else {
                  acc.push(sec);
                }
                return acc;
              }, [])
        );

        setHasMore(!!response.data.next);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setLoading(false);
      }
    },
    [loading, request]
  );

  useEffect(() => {
    fetchTasks(page);
  }, [page]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await fetchTasks(1, true);
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const renderItem = ({ item }: { item: DownloadTask }) => {
    const isDownloadEnabled = item.status === "completed";

    return (
      <View className="w-full h-full flex items-center px-5">
        <View className="p-4 mx-4 my-2 bg-[#fff] rounded-lg flex-row items-center shadow-xs w-full max-w-3xl">
          <View className="flex-1 px-1">
            <Text className="font-semibold leading-[2]">{item.file_name}</Text>
            <Text className="text-gray-600">
              {formatDateTime(item.created_at)}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              isDownloadEnabled &&
              Linking.openURL(`${getBaseUrl()}/${item.download_url}`)
            }
            disabled={!isDownloadEnabled}
          >
            {isDownloadEnabled ? (
              <ArrowDownCircleIcon
                size={24}
                className="text-sky-800 hover:text-sky-900"
              />
            ) : (
              <ActivityIndicator size="small" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.pk.toString()}
      renderItem={renderItem}
      renderSectionHeader={({ section: { title } }) => (
        <View className="p-5">
          <Text className="font-bold">{title}</Text>
        </View>
      )}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      ListFooterComponent={
        loading ? (
          <ActivityIndicator size="small" color="gray" className="p-5" />
        ) : !hasMore ? (
          <Divider label={i18n.t("No more data")} labelClassName="rounded-lg" />
        ) : null
      }
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.1}
    />
  );
}
