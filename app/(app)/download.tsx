import { Table } from "@/components/table/AntdTable";
import { useLocale } from "@/context/Locale";
import { getBaseUrl } from "@/utlis/webHelper";
import React from "react";
import { Text, TouchableOpacity, Linking } from "react-native";

export default function DownloadScreen() {
  const { i18n } = useLocale();

  const colConfig = {
    pk: { width: 50 },
    created_at: { hidden: true },
    completed_at: { hidden: true },
    task_id: { hidden: true },
    status: { hidden: true },
    file_name: { width: 500 },
    download_url: {
      render: (text: string, record: any) => {
        // Check if the status is 'completed', disable the download if it's not
        const isDownloadEnabled = record.status === "completed"; // Replace with your actual status check
        const baseUrl = getBaseUrl();

        return (
          <TouchableOpacity
            onPress={() => {
              if (isDownloadEnabled) {
                Linking.openURL(`${baseUrl}/${text}`);
              }
            }}
            disabled={!isDownloadEnabled} // Disable the TouchableOpacity if status is not 'completed'
          >
            <Text style={{ color: isDownloadEnabled ? "blue" : "gray" }}>
              {isDownloadEnabled ? i18n.t("download") : i18n.t("not_completed")}
            </Text>
          </TouchableOpacity>
        );
      },
    },
  };

  const actionConfig = {
    allowCreate: false,
    allowAdd: false,
    allowDelete: false,
    allowDownload: false,
    allowEdit: false,
  };

  return (
    <Table table="download" colConfig={colConfig} actionConfig={actionConfig} />
  );
}
