import React from "react";
import { TouchableOpacity, ActivityIndicator } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import i18n from "@/locale/i18n";
import { getBaseUrl } from "@/utils";
import { NativeTable } from "@/components/sea-saw-design/table/native";
import type { NativeColDefinition } from "@/components/sea-saw-design/table/native";

const STATUS_COLORS: Record<string, string> = {
  completed: "#52c41a",
  failed: "#ff4d4f",
  processing: "#1677ff",
  pending: "#faad14",
};

const COL_DEFS: Record<string, NativeColDefinition> = {
  file_name: {
    headerName: i18n.t("File"),
    width: 280,
    sortable: true,
  },
  status: {
    headerName: i18n.t("Status"),
    width: 110,
    sortable: true,
    renderCell: (value: string) => {
      const { Text } = require("react-native");
      return (
        <Text
          style={{
            color: STATUS_COLORS[value] ?? "#595959",
            fontSize: 12,
            fontWeight: "500",
          }}
        >
          {i18n.t(value ?? "")}
        </Text>
      );
    },
  },
  created_at: {
    headerName: i18n.t("Created At"),
    width: 180,
    sortable: true,
  },
  download_url: {
    headerName: "",
    width: 52,
    sortable: false,
    renderCell: (_value: any, row: Record<string, any>) => {
      const isCompleted = row.status === "completed";
      const isFailed = row.status === "failed";

      const handleDownload = () => {
        if (!isCompleted || !row.download_url) return;
        const url = row.download_url.startsWith("http")
          ? row.download_url
          : `${getBaseUrl()}/${row.download_url}`;
        window.open(url, "_blank");
      };

      if (isCompleted) {
        return (
          <TouchableOpacity
            onPress={handleDownload}
            // @ts-ignore — web only
            style={{ cursor: "pointer" }}
          >
            <Ionicons name="arrow-down-circle" size={22} color="#0e7490" />
          </TouchableOpacity>
        );
      }
      if (isFailed) {
        return <Ionicons name="close-circle" size={22} color="#ff4d4f" />;
      }
      return <ActivityIndicator size="small" color="#1677ff" />;
    },
  },
};

export default function DownloadScreen() {
  return (
    <NativeTable
      table="listDownloads"
      colDefinitions={COL_DEFS}
      queryParams={{ ordering: "-created_at" }}
      enableQuickFilter
      quickFilterParam="search"
      quickFilterPlaceholder={i18n.t("Search...")}
    />
  );
}
