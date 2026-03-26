import React from "react";
import { TouchableOpacity, ActivityIndicator } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { getBaseUrl } from "@/utils";

type Props = { row: Record<string, any> };

export function DownloadActionCell({ row }: Props) {
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
}
