import React from "react";
import { View } from "react-native";
import DownloadScreen from "@/components/sea-saw-page/download";

export default function Playground() {
  return (
    <View style={{ width: "100%", height: "100%" }}>
      <View className="h-96 w-full">
        <DownloadScreen />
      </View>
    </View>
  );
}
