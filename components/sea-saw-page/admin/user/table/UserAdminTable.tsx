import React, { useMemo } from "react";
import { View } from "react-native";
import type { CustomCellRendererProps } from "ag-grid-react";
import type { HeaderMetaProps } from "@/components/sea-saw-design/table/interface";
import Table from "@/components/sea-saw-design/table";
import { theme } from "@/components/sea-saw-design/table/theme";
import { Text } from "@/components/sea-saw-design/text";

interface UserAdminTableProps {
  tableRef?: React.Ref<any>;
  headerMeta?: HeaderMetaProps | Record<string, HeaderMetaProps>;
  queryParams?: Record<string, any>;
  columnOrder?: string[];
  [key: string]: any;
}

function StatusBadge({ active, trueLabel, falseLabel }: { active: boolean; trueLabel: string; falseLabel: string }) {
  return (
    <View
      className={`px-2 py-0.5 rounded-full self-center ${active ? "bg-green-100" : "bg-gray-100"}`}
    >
      <Text className={`text-xs font-medium ${active ? "text-green-700" : "text-gray-500"}`}>
        {active ? trueLabel : falseLabel}
      </Text>
    </View>
  );
}

export default function UserAdminTable({
  tableRef,
  headerMeta,
  queryParams,
  columnOrder,
  ...tableProps
}: UserAdminTableProps) {
  const colRenderers = useMemo(
    () => ({
      is_active: {
        cellRenderer: (params: CustomCellRendererProps) => (
          <StatusBadge active={Boolean(params.value)} trueLabel="Active" falseLabel="Inactive" />
        ),
      },
      is_staff: {
        cellRenderer: (params: CustomCellRendererProps) => (
          <StatusBadge active={Boolean(params.value)} trueLabel="Staff" falseLabel="Regular" />
        ),
      },
      role: {
        cellRenderer: (params: CustomCellRendererProps) => (
          <Text>{params.value?.role_name ?? "-"}</Text>
        ),
      },
    }),
    [],
  );

  return (
    <Table
      key={JSON.stringify(queryParams)}
      ref={tableRef}
      table="adminUser"
      headerMeta={headerMeta}
      theme={theme}
      colDefinitions={colRenderers}
      context={{ meta: headerMeta }}
      rowSelection={{ mode: "singleRow" }}
      queryParams={queryParams}
      columnOrder={columnOrder}
      hideWriteOnly
      {...tableProps}
    />
  );
}
