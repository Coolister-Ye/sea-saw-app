import { Text, Linking, Pressable, View } from "react-native";
import { DocumentIcon } from "react-native-heroicons/outline";

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
    return <Text className="text-slate-300 italic text-sm">未上传</Text>;
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
      className="inline-flex flex-row items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 active:bg-blue-100"
    >
      <DocumentIcon size={14} className="text-blue-600" />
      <Text className="text-blue-700 text-sm font-medium" numberOfLines={1}>
        {fileName}
      </Text>
    </Pressable>
  );
}
