import React, { ReactNode } from "react";
import { Platform, StyleSheet, ScrollView } from "react-native";
import { View } from "@/components/sea-saw-design/view";
import { Image as ExpoImage } from "expo-image";
import { Text } from "@/components/sea-saw-design/text";

const APP_LOGO = require("@/assets/images/app-logo.png");

export interface AuthLayoutProps {
  /** App name displayed in hero section */
  appName?: string;
  /** Title text for hero section */
  heroTitle: string;
  /** Subtitle/description for hero section */
  heroSubtitle: string;
  /** Feature highlights (3 items) */
  features: [string, string, string];
  /** Theme color for gradients and accents */
  themeColor?: "blue" | "green" | "purple" | "orange";
  /** Content to display in the right side (form, etc.) */
  children: ReactNode;
  /** Message context holder (for Ant Design message) */
  contextHolder?: ReactNode;
}

const themeColors = {
  blue: {
    gradient: "from-blue-600 to-blue-800",
    text: "text-blue-100",
    accent: "bg-blue-300",
    circle1: "bg-blue-500",
    circle2: "bg-blue-400",
    radialGlow: "rgba(59, 130, 246, 0.08)",
  },
  green: {
    gradient: "from-green-600 to-green-800",
    text: "text-green-100",
    accent: "bg-green-300",
    circle1: "bg-green-500",
    circle2: "bg-green-400",
    radialGlow: "rgba(34, 197, 94, 0.08)",
  },
  purple: {
    gradient: "from-purple-600 to-purple-800",
    text: "text-purple-100",
    accent: "bg-purple-300",
    circle1: "bg-purple-500",
    circle2: "bg-purple-400",
    radialGlow: "rgba(147, 51, 234, 0.08)",
  },
  orange: {
    gradient: "from-orange-600 to-orange-800",
    text: "text-orange-100",
    accent: "bg-orange-300",
    circle1: "bg-orange-500",
    circle2: "bg-orange-400",
    radialGlow: "rgba(249, 115, 22, 0.08)",
  },
};

export default function AuthLayout({
  appName = "Sea-Cube ERP",
  heroTitle,
  heroSubtitle,
  features,
  themeColor = "blue",
  children,
  contextHolder,
}: AuthLayoutProps) {
  const theme = themeColors[themeColor];

  const styles = StyleSheet.create({
    gridBackground: Platform.select({
      web: {
        backgroundImage:
          "linear-gradient(rgba(148, 163, 184, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.03) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      } as any,
      default: {},
    }),
    radialGlow: Platform.select({
      web: {
        backgroundImage: `radial-gradient(circle at 50% 50%, ${theme.radialGlow} 0%, transparent 50%)`,
      } as any,
      default: {},
    }),
  });

  return (
    <View className="flex min-h-full flex-1 relative bg-slate-50 dark:bg-slate-950">
      {contextHolder}

      {/* Background decorative elements */}
      <View
        className="absolute inset-0 opacity-30"
        style={styles.gridBackground}
      />
      <View className="absolute inset-0" style={styles.radialGlow} />

      {/* Main content container */}
      <View className="flex flex-1 flex-row min-h-full">
        {/* Left side - Hero section (hidden on mobile) */}
        <View
          className={`hidden lg:flex lg:w-1/2 relative items-center justify-center px-16 bg-gradient-to-br ${theme.gradient}`}
        >
          <View className="max-w-lg z-10">
            {/* Logo with white background and glow effect */}
            <View
              className="mb-5 items-center justify-center"
              style={{ width: 120, height: 120 }}
            >
              <View
                className="bg-white rounded-xl items-center justify-center"
                style={{
                  width: 100,
                  height: 100,
                  boxShadow: "0 0 20px rgba(255, 255, 255, 0.3)",
                  elevation: 10,
                }}
              >
                <ExpoImage
                  source={APP_LOGO}
                  style={{ width: 120, aspectRatio: 2.5 }}
                  contentFit="contain"
                  cachePolicy="memory-disk"
                />
              </View>
            </View>

            {/* Hero text */}
            <Text className="text-5xl font-bold mb-6 leading-tight text-white">
              {heroTitle} {"\n"}
              {appName}
            </Text>

            <Text className={`text-lg leading-relaxed ${theme.text} mb-12`}>
              {heroSubtitle}
            </Text>

            {/* Feature highlights */}
            <View className="flex flex-row gap-6">
              {features.map((feature, index) => (
                <View key={index} className="flex-1">
                  <View
                    className={`w-12 h-1 mb-3 ${theme.accent} rounded-full`}
                  />
                  <Text className={`text-sm ${theme.text} font-medium`}>
                    {feature}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Decorative circles */}
          <View
            className={`absolute top-20 right-20 w-64 h-64 ${theme.circle1} rounded-full opacity-20 blur-3xl`}
          />
          <View
            className={`absolute bottom-20 left-20 w-48 h-48 ${theme.circle2} rounded-full opacity-20 blur-3xl`}
          />
        </View>

        {/* Right side - Content area (scrollable) */}
        <View className="flex-1 lg:w-1/2 bg-white dark:bg-slate-900">
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              paddingHorizontal: 24,
              paddingVertical: 48,
            }}
          >
            <View className="mx-auto w-full max-w-md">
              {/* Mobile logo (visible only on mobile) */}
              <View className="lg:hidden mb-8 items-center">
                <ExpoImage
                  source={APP_LOGO}
                  style={{ width: 120, aspectRatio: 2.5 }}
                  contentFit="contain"
                  cachePolicy="memory-disk"
                />
              </View>

              {/* Content */}
              {children}
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
}
