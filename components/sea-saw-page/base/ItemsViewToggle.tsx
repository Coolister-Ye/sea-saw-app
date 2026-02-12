import React, { ComponentType, useState, useMemo } from "react";
import { View } from "react-native";
import i18n from "@/locale/i18n";
import { AppstoreOutlined, TableOutlined } from "@ant-design/icons";
import type { AgGridReactProps } from "ag-grid-react";
import {
  ViewToggle,
  type ViewToggleOption,
} from "@/components/sea-saw-design/view-toggle";

type ViewMode = "card" | "table";

interface CardComponentProps {
  def?: any;
  value?: any[] | null;
  onItemClick?: (index: number) => void;
}

interface TableComponentProps {
  def?: any;
  value?: any[] | null;
  agGridReactProps?: AgGridReactProps;
}

interface ItemsViewToggleProps {
  def?: any;
  value?: any[] | null;
  agGridReactProps?: AgGridReactProps;
  onItemClick?: (index: number) => void;
  CardComponent: ComponentType<CardComponentProps>;
  TableComponent: ComponentType<TableComponentProps>;
}

/**
 * Generic toggle between card and table view for order items.
 * Used by Purchase, Production, Order, and Outbound item view toggles.
 */
export default function ItemsViewToggle({
  def,
  value,
  agGridReactProps,
  onItemClick,
  CardComponent,
  TableComponent,
}: ItemsViewToggleProps) {
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
    [],
  );

  return (
    <View className="w-full">
      <View className="flex-row items-center justify-end mb-4">
        <ViewToggle
          options={toggleOptions}
          value={viewMode}
          onChange={setViewMode}
          size="sm"
          variant="default"
        />
      </View>

      <View className="w-full">
        {viewMode === "card" ? (
          <CardComponent def={def} value={value} onItemClick={onItemClick} />
        ) : (
          <TableComponent
            def={def}
            value={value}
            agGridReactProps={agGridReactProps}
          />
        )}
      </View>
    </View>
  );
}
