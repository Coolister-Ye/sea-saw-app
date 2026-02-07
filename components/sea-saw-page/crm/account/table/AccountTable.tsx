import React, { useMemo } from "react";
import { View } from "react-native";
import type { CustomCellRendererProps } from "ag-grid-react";

import Table from "@/components/sea-saw-design/table";
import { theme } from "@/components/sea-saw-design/table/theme";
import { Text } from "@/components/sea-saw-design/text";
import { ContactPopover } from "@/components/sea-saw-page/crm/contact/display";
import type { HeaderMetaProps } from "@/components/sea-saw-design/table/interface";

interface AccountTableProps {
  tableRef?: React.Ref<any>;
  headerMeta?: HeaderMetaProps | Record<string, HeaderMetaProps>;
  queryParams?: Record<string, any>;
  roleFilter: string;
  columnOrder?: string[];
  [key: string]: any;
}

export default function AccountTable({
  tableRef,
  headerMeta,
  queryParams,
  roleFilter,
  columnOrder,
  ...tableProps
}: AccountTableProps) {
  const colRenderers = useMemo(
    () => ({
      contacts: {
        cellRenderer: (params: CustomCellRendererProps) => {
          const contacts: any[] = params.value ?? [];
          if (!contacts.length) return <Text>-</Text>;
          return (
            <View className="flex-row flex-wrap gap-1">
              {contacts.map((contact: any, idx: number) => (
                <ContactPopover key={contact.id ?? idx} value={contact} />
              ))}
            </View>
          );
        },
      },
    }),
    [],
  );

  return (
    <Table
      key={roleFilter}
      ref={tableRef}
      table="account"
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
