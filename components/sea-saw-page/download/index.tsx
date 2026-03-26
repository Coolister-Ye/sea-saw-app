import React from "react";
import dayjs from "dayjs";
import i18n from "@/locale/i18n";
import { NativeTable } from "@/components/sea-saw-design/table/native";
import type { NativeColDefinition } from "@/components/sea-saw-design/table/native";
import { StatusCell } from "./StatusCell";
import { DownloadActionCell } from "./DownloadActionCell";

const COL_DEFS: Record<string, NativeColDefinition> = {
  // visible columns
  file_name: { flex: 3, minWidth: 200, sortable: true },
  status: {
    flex: 1,
    minWidth: 100,
    sortable: true,
    renderCell: (value, _row, fieldMeta) => (
      <StatusCell value={value} fieldMeta={fieldMeta} />
    ),
  },
  created_at: {
    flex: 2,
    minWidth: 140,
    sortable: true,
    valueFormatter: ({ value }) => {
      if (!value) return "";
      const d = dayjs(value);
      return d.isValid() ? d.format("YYYY-MM-DD HH:mm:ss") : String(value);
    },
  },
  download_url: {
    headerName: "",
    width: 52,
    sortable: false,
    suppressMenu: true,
    suppressAutoSize: true,
    renderCell: (_value, row) => <DownloadActionCell row={row} />,
  },
  // visible extra columns
  pk: { width: 80, sortable: false },
  error_message: { flex: 2, minWidth: 120, sortable: false },
  // hidden columns
  user: { skip: true },
  task_id: { skip: true },
  file_path: { skip: true },
  completed_at: { skip: true },
  expires_at: { skip: true },
  deleted: { skip: true },
  total_records: { skip: true },
  processed_records: { skip: true },
  progress_percentage: { skip: true },
};

export default function DownloadScreen() {
  return (
    <NativeTable
      table="listDownloads"
      colDefinitions={COL_DEFS}
      columnOrder={[
        "pk",
        "file_name",
        "status",
        "created_at",
        "error_message",
        "download_url",
      ]}
      queryParams={{ ordering: "-created_at" }}
      enableQuickFilter
      quickFilterParam="search"
      quickFilterPlaceholder={i18n.t("Search...")}
    />
  );
}
