/**
 * ViewToggle Component Examples
 *
 * This file demonstrates all variants and sizes of the ViewToggle component.
 * Use this as a reference for implementation.
 */

import React, { useState } from "react";
import { View } from "react-native";
import { ViewToggle, type ViewToggleOption } from "./ViewToggle";
import { Text } from "@/components/sea-saw-design/text";
import {
  AppstoreOutlined,
  TableOutlined,
  UnorderedListOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

type ViewMode = "card" | "table";
type LayoutMode = "grid" | "list" | "timeline";

export function ViewToggleExamples() {
  // Basic two-option toggle
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  // Three-option toggle
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("grid");

  const basicOptions: ViewToggleOption<ViewMode>[] = [
    {
      value: "card",
      label: "Card View",
      icon: <AppstoreOutlined />,
    },
    {
      value: "table",
      label: "Table View",
      icon: <TableOutlined />,
    },
  ];

  const layoutOptions: ViewToggleOption<LayoutMode>[] = [
    {
      value: "grid",
      label: "Grid",
      icon: <AppstoreOutlined />,
    },
    {
      value: "list",
      label: "List",
      icon: <UnorderedListOutlined />,
    },
    {
      value: "timeline",
      label: "Timeline",
      icon: <CalendarOutlined />,
    },
  ];

  return (
    <View className="p-8 gap-12 bg-white">
      {/* Size Variants */}
      <View className="gap-6">
        <Text className="text-2xl font-bold text-slate-900">Size Variants</Text>

        <View className="gap-4">
          <View className="gap-2">
            <Text className="text-sm font-medium text-slate-600">
              Small (sm)
            </Text>
            <ViewToggle
              options={basicOptions}
              value={viewMode}
              onChange={setViewMode}
              size="sm"
              variant="default"
            />
          </View>

          <View className="gap-2">
            <Text className="text-sm font-medium text-slate-600">
              Medium (md) - Default
            </Text>
            <ViewToggle
              options={basicOptions}
              value={viewMode}
              onChange={setViewMode}
              size="md"
              variant="default"
            />
          </View>

          <View className="gap-2">
            <Text className="text-sm font-medium text-slate-600">
              Large (lg)
            </Text>
            <ViewToggle
              options={basicOptions}
              value={viewMode}
              onChange={setViewMode}
              size="lg"
              variant="default"
            />
          </View>
        </View>
      </View>

      {/* Style Variants */}
      <View className="gap-6">
        <Text className="text-2xl font-bold text-slate-900">
          Style Variants
        </Text>

        <View className="gap-4">
          <View className="gap-2">
            <Text className="text-sm font-medium text-slate-600">Default</Text>
            <ViewToggle
              options={basicOptions}
              value={viewMode}
              onChange={setViewMode}
              variant="default"
            />
          </View>

          <View className="gap-2">
            <Text className="text-sm font-medium text-slate-600">Pill</Text>
            <ViewToggle
              options={basicOptions}
              value={viewMode}
              onChange={setViewMode}
              variant="pill"
            />
          </View>

          <View className="gap-2">
            <Text className="text-sm font-medium text-slate-600">Minimal</Text>
            <ViewToggle
              options={basicOptions}
              value={viewMode}
              onChange={setViewMode}
              variant="minimal"
            />
          </View>
        </View>
      </View>

      {/* Three Options */}
      <View className="gap-6">
        <Text className="text-2xl font-bold text-slate-900">
          Multiple Options
        </Text>

        <View className="gap-4">
          <View className="gap-2">
            <Text className="text-sm font-medium text-slate-600">
              Default Style
            </Text>
            <ViewToggle
              options={layoutOptions}
              value={layoutMode}
              onChange={setLayoutMode}
              variant="default"
            />
          </View>

          <View className="gap-2">
            <Text className="text-sm font-medium text-slate-600">
              Pill Style
            </Text>
            <ViewToggle
              options={layoutOptions}
              value={layoutMode}
              onChange={setLayoutMode}
              variant="pill"
            />
          </View>

          <View className="gap-2">
            <Text className="text-sm font-medium text-slate-600">
              Minimal Style
            </Text>
            <ViewToggle
              options={layoutOptions}
              value={layoutMode}
              onChange={setLayoutMode}
              variant="minimal"
            />
          </View>
        </View>
      </View>

      {/* Without Icons */}
      <View className="gap-6">
        <Text className="text-2xl font-bold text-slate-900">Without Icons</Text>

        <View className="gap-4">
          <ViewToggle
            options={[
              { value: "card", label: "Card" },
              { value: "table", label: "Table" },
            ]}
            value={viewMode}
            onChange={setViewMode}
            variant="default"
          />

          <ViewToggle
            options={[
              { value: "card", label: "Card" },
              { value: "table", label: "Table" },
            ]}
            value={viewMode}
            onChange={setViewMode}
            variant="pill"
          />
        </View>
      </View>

      {/* Combined: Large + Pill */}
      <View className="gap-6">
        <Text className="text-2xl font-bold text-slate-900">
          Showcase: Large Pill
        </Text>

        <ViewToggle
          options={layoutOptions}
          value={layoutMode}
          onChange={setLayoutMode}
          size="lg"
          variant="pill"
        />
      </View>
    </View>
  );
}
