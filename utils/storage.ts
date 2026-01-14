import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const isWeb = Platform.OS === "web";

// 存储数据（如果 value 为 null，则删除存储）
export async function setLocalData<T = string>(key: string, value: T | null) {
  if (value === null) {
    return removeLocalData(key);
  }

  const valueStr = typeof value === "string" ? value : JSON.stringify(value);
  return isWeb
    ? AsyncStorage.setItem(key, valueStr)
    : SecureStore.setItemAsync(key, valueStr);
}

// 获取数据
export async function getLocalData<T = string>(key: string): Promise<T | null> {
  const data = isWeb
    ? await AsyncStorage.getItem(key)
    : await SecureStore.getItemAsync(key);

  if (!data) return null;

  try {
    return JSON.parse(data) as T; // 解析 JSON
  } catch {
    return data as T;
  }
}

// 删除数据
export async function removeLocalData(key: string): Promise<void> {
  return isWeb
    ? AsyncStorage.removeItem(key)
    : SecureStore.deleteItemAsync(key);
}
