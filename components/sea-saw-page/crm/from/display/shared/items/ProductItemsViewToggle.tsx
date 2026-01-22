import React, { useState, useMemo } from "react";
import { View } from "react-native";
import type { AgGridReactProps } from "ag-grid-react";
import { AppstoreOutlined, TableOutlined } from "@ant-design/icons";
import { useLocale } from "@/context/Locale";
import {
  ViewToggle,
  type ViewToggleOption,
} from "@/components/sea-saw-design/view-toggle";
import ProductItemsCard from "./ProductItemsCard";
import ProductItemsTable from "./ProductItemsTable";

type ViewMode = "card" | "table";

interface ProductItemsViewToggleProps {
  def?: any;
  value?: any[] | null;
  agGridReactProps?: AgGridReactProps;
  onItemClick?: (index: number) => void;
}

export default function ProductItemsViewToggle({
  def,
  value,
  agGridReactProps,
  onItemClick,
}: ProductItemsViewToggleProps) {
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
          <ProductItemsCard def={def} value={value} onItemClick={onItemClick} />
        ) : (
          <ProductItemsTable
            def={def}
            value={value}
            agGridReactProps={agGridReactProps}
          />
        )}
      </View>
    </View>
  );
}
