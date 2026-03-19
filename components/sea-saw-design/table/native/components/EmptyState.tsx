import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import i18n from "@/locale/i18n";

export function EmptyState() {
  return (
    <View style={styles.container}>
      <Ionicons name="file-tray-outline" size={48} color="#9ca3af" />
      <Text style={styles.text}>{i18n.t("No data yet")}</Text>
    </View>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle-outline" size={48} color="#ff4d4f" />
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
  },
  text: {
    fontSize: 14,
    color: "#9ca3af",
  },
  errorText: {
    fontSize: 14,
    color: "#ff4d4f",
    textAlign: "center",
  },
});
