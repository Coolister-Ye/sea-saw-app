import type { PresetColor, StatusColor } from "./types";

export const PRESET_COLORS = new Set<PresetColor>([
  "magenta",
  "red",
  "volcano",
  "orange",
  "gold",
  "yellow",
  "lime",
  "green",
  "cyan",
  "blue",
  "geekblue",
  "purple",
  "pink",
]);

export const STATUS_COLORS = new Set<StatusColor>([
  "success",
  "processing",
  "error",
  "warning",
  "default",
]);

// antd: paddingInline = tagPaddingHorizontal(8) - lineWidth(1) = 7px
// antd: borderRadiusSM = 4px → rounded
export const presetContainer: Record<PresetColor, string> = {
  magenta: "bg-fuchsia-50 border-fuchsia-200",
  red: "bg-red-50 border-red-200",
  volcano: "bg-orange-50 border-orange-300",
  orange: "bg-orange-50 border-orange-200",
  gold: "bg-yellow-50 border-yellow-300",
  yellow: "bg-yellow-50 border-yellow-200",
  lime: "bg-lime-50 border-lime-200",
  green: "bg-green-50 border-green-200",
  cyan: "bg-cyan-50 border-cyan-200",
  blue: "bg-blue-50 border-blue-200",
  geekblue: "bg-indigo-50 border-indigo-200",
  purple: "bg-purple-50 border-purple-200",
  pink: "bg-pink-50 border-pink-200",
};

// antd: tagFontSize = fontSizeSM = 12px
export const presetText: Record<PresetColor, string> = {
  magenta: "text-fuchsia-600",
  red: "text-red-500",
  volcano: "text-orange-600",
  orange: "text-orange-500",
  gold: "text-yellow-600",
  yellow: "text-yellow-500",
  lime: "text-lime-600",
  green: "text-green-600",
  cyan: "text-cyan-600",
  blue: "text-blue-500",
  geekblue: "text-indigo-600",
  purple: "text-purple-600",
  pink: "text-pink-500",
};

export const statusContainer: Record<StatusColor, string> = {
  default: "bg-gray-100 border-gray-300",
  success: "bg-green-50 border-green-200",
  processing: "bg-blue-50 border-blue-200",
  error: "bg-red-50 border-red-200",
  warning: "bg-orange-50 border-orange-200",
};

export const statusText: Record<StatusColor, string> = {
  default: "text-gray-600",
  success: "text-green-600",
  processing: "text-blue-500",
  error: "text-red-500",
  warning: "text-orange-500",
};

export type ColorKind = "preset" | "status" | "custom";

export function resolveColorKind(color?: string): ColorKind {
  if (!color) return "status";
  if (PRESET_COLORS.has(color as PresetColor)) return "preset";
  if (STATUS_COLORS.has(color as StatusColor)) return "status";
  return "custom";
}
