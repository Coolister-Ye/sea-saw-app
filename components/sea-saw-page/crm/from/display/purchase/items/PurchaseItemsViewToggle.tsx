import React, { useState } from "react";
import i18n from '@/locale/i18n';
import { View } from "react-native";
import { Radio, Tooltip } from "antd";
import type { AgGridReactProps } from "ag-grid-react";
import { AppstoreOutlined, TableOutlined } from "@ant-design/icons";
import PurchaseItemsCard from "./PurchaseItemsCard";
import PurchaseItemsTable from "./PurchaseItemsTable";
type ViewMode = "card" | "table";

interface PurchaseItemsViewToggleProps {
  def?: any;
  value?: any[] | null;
  agGridReactProps?: AgGridReactProps;
  onItemClick?: (item: any) => void;
}

export default function PurchaseItemsViewToggle({
  def,
  value,
  agGridReactProps,
  onItemClick,
}: PurchaseItemsViewToggleProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("card");

  return (
    <View className="w-full space-y-3">
      {/* View Mode Toggle */}
      <View className="flex-row items-center justify-end">
        <Radio.Group
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value)}
          size="small"
        >
          <Tooltip title={i18n.t("Card View")}>
            <Radio.Button value="card">
              <AppstoreOutlined />
            </Radio.Button>
          </Tooltip>
          <Tooltip title={i18n.t("Table View")}>
            <Radio.Button value="table">
              <TableOutlined />
            </Radio.Button>
          </Tooltip>
        </Radio.Group>
      </View>

      {/* Conditional Rendering */}
      {viewMode === "card" ? (
        <PurchaseItemsCard def={def} value={value} onItemClick={onItemClick} />
      ) : (
        <PurchaseItemsTable
          def={def}
          value={value}
          agGridReactProps={agGridReactProps}
        />
      )}
    </View>
  );
}
