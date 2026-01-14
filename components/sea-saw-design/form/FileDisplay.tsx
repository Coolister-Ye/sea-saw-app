import { Text, Linking, Pressable } from "react-native";
import { PaperClipIcon } from "react-native-heroicons/outline";

/* ========================
 * Types
 * ======================== */
interface FileDisplayProps {
  value: any;
}

/* ========================
 * File Display Component
 * 用于在 DisplayForm 中显示文件字段
 * ======================== */
export default function FileDisplay({ value }: FileDisplayProps) {
  if (!value) {
    return <Text className="text-gray-400 text-sm">-</Text>;
  }

  // 处理不同的文件值格式
  let fileName = "";
  let fileUrl = "";

  if (typeof value === "string") {
    // 如果是 URL 字符串
    fileUrl = value;
    fileName = value.split("/").pop() || "file";
  } else if (value?.name || value?.filename) {
    // 如果是文件对象
    fileName = value.name || value.filename;
    fileUrl = value.url || value.file || "";
  } else if (value?.url) {
    fileUrl = value.url;
    fileName = value.url.split("/").pop() || "file";
  }

  const handlePress = () => {
    if (fileUrl) {
      Linking.openURL(fileUrl).catch((err) =>
        console.error("Failed to open file:", err)
      );
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      className="flex-row w-full items-center gap-1 py-1 hover:bg-gray-100 rounded"
    >
      <PaperClipIcon size={16} className="text-blue-500" />
      <Text className="text-blue-500 text-sm" numberOfLines={1}>
        {fileName}
      </Text>
    </Pressable>
  );
}
