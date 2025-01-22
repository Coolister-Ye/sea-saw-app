import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export async function setLocalData(key: string, value: string | object) {
  const valueStr = typeof value === "string" ? value : JSON.stringify(value);

  if (Platform.OS === "web") {
    await AsyncStorage.setItem(key, valueStr);
  } else {
    await SecureStore.setItemAsync(key, valueStr);
  }
}

export async function getLocalData(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    return await AsyncStorage.getItem(key);
  } else {
    return await SecureStore.getItemAsync(key);
  }
}

export async function removeLocalData(key: string): Promise<void> {
  if (Platform.OS === "web") {
    await AsyncStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}
