import React from "react";
import i18n from "@/locale/i18n";
import { View, Pressable } from "react-native";
import { Switch, Tooltip } from "antd";
import {
  LinkOutlined,
  ThunderboltOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

import { Text } from "@/components/sea-saw-design/text";

/* ========================
 * Types
 * ======================== */
interface AutoCreateOrderToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

/* ========================
 * Component
 * ======================== */
export default function AutoCreateOrderToggle({
  checked,
  onChange,
  disabled = false,
}: AutoCreateOrderToggleProps) {
  return (
    <View
      className={`
        mt-3 p-4 rounded-xl border
        ${
          checked
            ? "bg-indigo-50/80 border-indigo-200"
            : "bg-gradient-to-br from-slate-50 to-purple-50/30 border-slate-200/60"
        }
        ${disabled ? "opacity-50" : ""}
      `}
    >
      <View className="flex-row items-center justify-between">
        {/* Left: Icon + Text */}
        <View className="flex-row items-center flex-1">
          {/* Icon Container */}
          <View
            className={`
              w-10 h-10 rounded-lg mr-3
              items-center justify-center
              ${
                checked
                  ? "bg-gradient-to-br from-indigo-500 to-purple-600"
                  : "bg-gradient-to-br from-slate-400 to-slate-500"
              }
            `}
            style={{
              shadowColor: checked ? "#6366f1" : "#64748b",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <ThunderboltOutlined
              style={{
                color: "#fff",
                fontSize: 20,
              }}
            />
          </View>

          {/* Text Content */}
          <View className="flex-1">
            <View className="flex-row items-center gap-1.5">
              <Text
                className={`
                  font-semibold text-sm
                  ${checked ? "text-indigo-900" : "text-slate-700"}
                `}
              >
                {i18n.t("Auto-create Order")}
              </Text>
              <Tooltip
                title={i18n.t(
                  "When enabled, a new order will be automatically created and linked to this pipeline",
                )}
                placement="top"
              >
                <Pressable>
                  <InfoCircleOutlined
                    style={{
                      color: checked ? "#a5b4fc" : "#94a3b8",
                      fontSize: 14,
                    }}
                  />
                </Pressable>
              </Tooltip>
            </View>

            <Text
              className={`
                text-xs mt-0.5
                ${checked ? "text-indigo-600" : "text-slate-500"}
              `}
            >
              {checked ? (
                <View className="flex-row items-center gap-1">
                  <LinkOutlined style={{ fontSize: 11, color: "#4f46e5" }} />
                  <Text className="text-xs text-indigo-600">
                    {i18n.t("A new order will be created with pipeline data")}
                  </Text>
                </View>
              ) : (
                i18n.t("Select an existing order or create one automatically")
              )}
            </Text>
          </View>
        </View>

        {/* Right: Switch */}
        <Switch
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={checked ? "bg-indigo-500" : ""}
          style={{
            backgroundColor: checked ? "#6366f1" : undefined,
          }}
        />
      </View>

      {/* Active State Indicator */}
      {checked && (
        <View className="mt-3 pt-3 border-t border-indigo-200/50">
          <View className="flex-row items-center gap-2">
            <View className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Text className="text-xs text-indigo-600/80 font-medium">
              {i18n.t("Order will be created on save")}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

export { AutoCreateOrderToggle };
