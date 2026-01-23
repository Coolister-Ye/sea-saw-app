import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import i18n from '@/locale/i18n';
import {
  View,
  Text,
  SectionList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Linking,
} from "react-native";
import { getBaseUrl } from "@/utils";
import useDataService from "@/hooks/useDataService";
import Divider from "@/components/sea-saw-design/divider";
import { ArrowDownCircleIcon } from "react-native-heroicons/solid";
import { devError } from "@/utils/logger";

type DownloadTask = {
  pk: number;
  task_id: string;
  file_name: string;
  download_url: string;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
};

type SectionData = {
  title: string;
  data: DownloadTask[];
};

const PAGE_SIZE = 50;

/**
 * Format date to YYYY-MM-DD format
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
};

/**
 * Format time to HH:MM:SS format
 */
const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  const timeStr = date.toISOString().split("T")[1].split(".")[0];
  return timeStr;
};

export default function DownloadScreen() {
  const { request } = useDataService();
  const [sections, setSections] = useState<SectionData[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const isMountedRef = useRef(true);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const lastPageRef = useRef(0);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchTasks = useCallback(
    async (pageNum: number, isRefresh = false) => {
      // Prevent concurrent requests
      if (loadingRef.current || !isMountedRef.current) return;

      // Don't fetch if no more data (unless it's a refresh or first page)
      if (!isRefresh && pageNum > 1 && !hasMoreRef.current) {
        devError(`Skipping fetch for page ${pageNum} - no more data available`);
        return;
      }

      // Prevent duplicate requests for the same page (unless it's a refresh)
      if (!isRefresh && lastPageRef.current === pageNum) {
        devError(`Skipping duplicate fetch for page ${pageNum}`);
        return;
      }

      loadingRef.current = true;
      setLoading(true);
      lastPageRef.current = pageNum;

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

        if (!isMountedRef.current) return;

        // Backend already sorts by -created_at, no need to sort again
        const fetchedTasks: DownloadTask[] = response.data.results;

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
                  // Avoid duplicates by checking pk
                  const existingIds = new Set(existing.data.map(t => t.pk));
                  const newItems = sec.data.filter(t => !existingIds.has(t.pk));
                  existing.data = [...existing.data, ...newItems];
                } else {
                  acc.push(sec);
                }
                return acc;
              }, [])
        );

        const hasMoreData = !!response.data.next;
        hasMoreRef.current = hasMoreData;
        setHasMore(hasMoreData);
      } catch (error: any) {
        if (!isMountedRef.current) return;

        if (error?.response?.status === 404) {
          // Invalid page - no more data
          hasMoreRef.current = false;
          setHasMore(false);
          devError(`Page ${pageNum} not found - reached end of data`);
        } else {
          devError("Failed to fetch download tasks:", error);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
        loadingRef.current = false;
      }
    },
    [request]
  );

  useEffect(() => {
    fetchTasks(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleRefresh = useCallback(async () => {
    if (loadingRef.current) return;

    setRefreshing(true);
    hasMoreRef.current = true;
    lastPageRef.current = 0;
    setHasMore(true);

    try {
      await fetchTasks(1, true);
      setPage(1);
    } catch (error) {
      devError("Failed to refresh download tasks:", error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchTasks]);

  const handleLoadMore = useCallback(() => {
    if (!loadingRef.current && hasMoreRef.current && hasMore && !refreshing) {
      setPage((prev) => prev + 1);
    }
  }, [hasMore, refreshing]);

  const handleDownload = useCallback((item: DownloadTask) => {
    if (item.status === "completed" && item.download_url) {
      const url = item.download_url.startsWith('http')
        ? item.download_url
        : `${getBaseUrl()}/${item.download_url}`;
      Linking.openURL(url).catch(error => {
        devError("Failed to open download URL:", error);
      });
    }
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: DownloadTask }) => {
      const isCompleted = item.status === "completed";
      const isFailed = item.status === "failed";

      return (
        <View className="w-full h-full flex items-center px-5">
          <View className="p-4 mx-4 my-2 bg-[#fff] rounded-lg flex-row items-center shadow-xs w-full max-w-3xl">
            <View className="flex-1 px-1">
              <Text className="font-semibold leading-[2]">{item.file_name}</Text>
              <View className="flex-row items-center gap-2">
                <Text className="text-gray-600">
                  {formatDateTime(item.created_at)}
                </Text>
                {isFailed && (
                  <Text className="text-red-600 text-xs">
                    {i18n.t("Failed")}
                  </Text>
                )}
              </View>
            </View>
            <TouchableOpacity
              onPress={() => handleDownload(item)}
              disabled={!isCompleted}
            >
              {isCompleted ? (
                <ArrowDownCircleIcon
                  size={24}
                  className="text-sky-800"
                />
              ) : isFailed ? (
                <Text className="text-red-500 text-xl">✕</Text>
              ) : (
                <ActivityIndicator size="small" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      );
    },
    [handleDownload]
  );

  const renderSectionHeader = useCallback(
    ({ section: { title } }: { section: SectionData }) => (
      <View className="p-5">
        <Text className="font-bold text-gray-800 dark:text-gray-200">{title}</Text>
      </View>
    ),
    []
  );

  const keyExtractor = useCallback((item: DownloadTask) => item.pk.toString(), []);

  const listEmptyComponent = useMemo(
    () =>
      !loading && !refreshing ? (
        <View className="flex-1 justify-center items-center p-10">
          <Text className="text-gray-500 text-center">
            {i18n.t("No download tasks")}
          </Text>
        </View>
      ) : null,
    [loading, refreshing]
  );

  const listFooterComponent = useMemo(
    () =>
      loading && !refreshing ? (
        <View className="p-5">
          <ActivityIndicator size="small" color="gray" />
        </View>
      ) : !hasMore && sections.length > 0 ? (
        <Divider textClassName="rounded-lg">{i18n.t("No more data")}</Divider>
      ) : null,
    [loading, refreshing, hasMore, sections.length]
  );

  const refreshControl = useMemo(
    () => <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />,
    [refreshing, handleRefresh]
  );

  return (
    <SectionList
      sections={sections}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      refreshControl={refreshControl}
      ListEmptyComponent={listEmptyComponent}
      ListFooterComponent={listFooterComponent}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={10}
      windowSize={5}
    />
  );
}
