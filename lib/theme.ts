import { DarkTheme, DefaultTheme, type Theme } from "@react-navigation/native";

/**
 * Ant Design 风格主题配置
 * 基于 antd 5.x 默认主题色板
 */
export const THEME = {
  light: {
    // 基础色
    background: "hsl(0 0% 100%)",
    foreground: "hsl(0 0% 15%)",

    // 容器色
    card: "hsl(0 0% 100%)",
    cardForeground: "hsl(0 0% 15%)",
    popover: "hsl(0 0% 100%)",
    popoverForeground: "hsl(0 0% 15%)",

    // 主色 - Primary (antd #1677ff)
    primary: "hsl(215 100% 55%)",
    primaryForeground: "hsl(0 0% 100%)",
    primaryHover: "hsl(215 100% 62%)",
    primaryActive: "hsl(215 100% 45%)",
    primaryBg: "hsl(215 100% 97%)",

    // 成功色 - Success (antd #52c41a)
    success: "hsl(100 77% 44%)",
    successForeground: "hsl(0 0% 100%)",
    successBg: "hsl(100 77% 97%)",

    // 警告色 - Warning (antd #faad14)
    warning: "hsl(37 95% 53%)",
    warningForeground: "hsl(0 0% 100%)",
    warningBg: "hsl(37 95% 97%)",

    // 错误色 - Error (antd #ff4d4f)
    error: "hsl(359 100% 65%)",
    errorForeground: "hsl(0 0% 100%)",
    errorBg: "hsl(359 100% 97%)",

    // 信息色 - Info
    info: "hsl(215 100% 55%)",
    infoForeground: "hsl(0 0% 100%)",
    infoBg: "hsl(215 100% 97%)",

    // 次要色
    secondary: "hsl(0 0% 96%)",
    secondaryForeground: "hsl(0 0% 25%)",

    // 中性色
    muted: "hsl(0 0% 96%)",
    mutedForeground: "hsl(0 0% 45%)",
    accent: "hsl(0 0% 96%)",
    accentForeground: "hsl(0 0% 15%)",

    // 边框和输入
    border: "hsl(0 0% 85%)",
    input: "hsl(0 0% 85%)",
    ring: "hsl(215 100% 55%)",

    // 禁用状态
    disabled: "hsl(0 0% 96%)",
    disabledForeground: "hsl(0 0% 65%)",

    // 分割线
    divider: "hsl(0 0% 94%)",

    // 圆角
    radius: "0.375rem",

    // 图表色
    chart1: "hsl(215 100% 55%)",
    chart2: "hsl(100 77% 44%)",
    chart3: "hsl(37 95% 53%)",
    chart4: "hsl(359 100% 65%)",
    chart5: "hsl(270 60% 60%)",
  },
  dark: {
    // 基础色
    background: "hsl(0 0% 8%)",
    foreground: "hsl(0 0% 93%)",

    // 容器色
    card: "hsl(0 0% 11%)",
    cardForeground: "hsl(0 0% 93%)",
    popover: "hsl(0 0% 14%)",
    popoverForeground: "hsl(0 0% 93%)",

    // 主色 - Primary (antd dark #1668dc)
    primary: "hsl(215 85% 48%)",
    primaryForeground: "hsl(0 0% 100%)",
    primaryHover: "hsl(215 85% 55%)",
    primaryActive: "hsl(215 85% 40%)",
    primaryBg: "hsl(215 85% 12%)",

    // 成功色 - Success
    success: "hsl(100 65% 40%)",
    successForeground: "hsl(0 0% 100%)",
    successBg: "hsl(100 65% 10%)",

    // 警告色 - Warning
    warning: "hsl(37 85% 48%)",
    warningForeground: "hsl(0 0% 100%)",
    warningBg: "hsl(37 85% 10%)",

    // 错误色 - Error
    error: "hsl(359 85% 55%)",
    errorForeground: "hsl(0 0% 100%)",
    errorBg: "hsl(359 85% 12%)",

    // 信息色 - Info
    info: "hsl(215 85% 48%)",
    infoForeground: "hsl(0 0% 100%)",
    infoBg: "hsl(215 85% 12%)",

    // 次要色
    secondary: "hsl(0 0% 17%)",
    secondaryForeground: "hsl(0 0% 85%)",

    // 中性色
    muted: "hsl(0 0% 17%)",
    mutedForeground: "hsl(0 0% 55%)",
    accent: "hsl(0 0% 17%)",
    accentForeground: "hsl(0 0% 93%)",

    // 边框和输入
    border: "hsl(0 0% 24%)",
    input: "hsl(0 0% 24%)",
    ring: "hsl(215 85% 48%)",

    // 禁用状态
    disabled: "hsl(0 0% 17%)",
    disabledForeground: "hsl(0 0% 40%)",

    // 分割线
    divider: "hsl(0 0% 20%)",

    // 圆角
    radius: "0.375rem",

    // 图表色
    chart1: "hsl(215 85% 55%)",
    chart2: "hsl(100 65% 48%)",
    chart3: "hsl(37 85% 55%)",
    chart4: "hsl(359 85% 60%)",
    chart5: "hsl(270 55% 55%)",
  },
};

export const NAV_THEME: Record<"light" | "dark", Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      background: THEME.light.background,
      border: THEME.light.border,
      card: THEME.light.card,
      notification: THEME.light.error,
      primary: THEME.light.primary,
      text: THEME.light.foreground,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      background: THEME.dark.background,
      border: THEME.dark.border,
      card: THEME.dark.card,
      notification: THEME.dark.error,
      primary: THEME.dark.primary,
      text: THEME.dark.foreground,
    },
  },
};
