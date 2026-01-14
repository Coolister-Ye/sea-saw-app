import React, { useState } from "react";
import { View } from "react-native";
import { Radio, Tooltip } from "antd";
import type { AgGridReactProps } from "ag-grid-react";
import { AppstoreOutlined, TableOutlined } from "@ant-design/icons";
import { useLocale } from "@/context/Locale";
import ProductionItemsDisplay from "./ProductionItemsCard";
import ProductionItemsTable from "./ProductionItemsTable";
import { ProductionItemsDisplayProps } from "../types";

type ViewMode = "card" | "table";

interface ProductionItemsViewToggleProps extends ProductionItemsDisplayProps {
  agGridReactProps?: AgGridReactProps;
  onItemClick?: (index: number) => void;
}

export default function ProductionItemsViewToggle({
  def,
  value,
  agGridReactProps,
  onItemClick,
}: ProductionItemsViewToggleProps) {
  const { i18n } = useLocale();
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

      {/* Display Mode */}
      {viewMode === "card" ? (
        <ProductionItemsDisplay
          def={def}
          value={value}
          onItemClick={onItemClick}
        />
      ) : (
        <ProductionItemsTable
          def={def}
          value={value}
          agGridReactProps={agGridReactProps}
        />
      )}
    </View>
  );
}
