import React, { useState, useMemo } from "react";
import { View } from "react-native";
import type { AgGridReactProps } from "ag-grid-react";
import { AppstoreOutlined, TableOutlined } from "@ant-design/icons";
import { useLocale } from "@/context/Locale";
import {
  ViewToggle,
  type ViewToggleOption,
} from "@/components/sea-saw-design/view-toggle";
import ProductionItemsCard from "./ProductionItemsCard";
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
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  const toggleOptions = useMemo<ViewToggleOption<ViewMode>[]>(
    () => [
      {
        value: "card",
        label: i18n.t("Card View"),
        icon: <AppstoreOutlined />,
      },
      {
        value: "table",
        label: i18n.t("Table View"),
        icon: <TableOutlined />,
      },
    ],
    [i18n],
  );

  return (
    <View className="w-full">
      {/* View Mode Toggle */}
      <View className="flex-row items-center justify-end mb-4">
        <ViewToggle
          options={toggleOptions}
          value={viewMode}
          onChange={setViewMode}
          size="md"
          variant="default"
        />
      </View>

      {/* Display Mode */}
      <View className="w-full">
        {viewMode === "card" ? (
          <ProductionItemsCard
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
    </View>
  );
}
