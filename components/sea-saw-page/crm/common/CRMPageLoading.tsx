/**
 * CRMPageLoading - CRM 页面的加载和错误状态组件
 */

import React from "react";
import { View, ActivityIndicator } from "react-native";
import { Text } from "@/components/sea-saw-design/text";

interface CRMPageLoadingProps {
  loading: boolean;
  error: string | null;
  children: React.ReactNode;
}

export function CRMPageLoading({
  loading,
  error,
  children,
}: CRMPageLoadingProps) {
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-500">{error}</Text>
      </View>
    );
  }

  return <>{children}</>;
}

export default CRMPageLoading;
