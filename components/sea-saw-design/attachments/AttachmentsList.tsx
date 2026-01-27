import React from "react";
import { View, Linking, Pressable } from "react-native";
import { Text } from "@/components/sea-saw-design/text";

/* ========================
 * Types
 * ======================== */
interface Attachment {
  id?: number;
  file?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  description?: string;
}

interface AttachmentsListProps {
  value?: Attachment[] | null;
  showEmpty?: boolean;
  emptyText?: string;
}

/* ========================
 * Utilities
 * ======================== */
const formatFileSize = (bytes?: number): string => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileExtension = (filename?: string): string => {
  if (!filename) return "";
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop()?.toUpperCase() || "" : "";
};

/* ========================
 * Attachments List Component
 * A reusable component for displaying file attachments with detailed info
 * ======================== */
export default function AttachmentsList({
  value,
  showEmpty = false,
  emptyText = "-",
}: AttachmentsListProps) {
  if (!value || !Array.isArray(value) || value.length === 0) {
    return showEmpty ? (
      <Text className="text-sm text-slate-400">{emptyText}</Text>
    ) : null;
  }

  return (
    <View className="gap-2">
      {value.map((attachment, idx) => {
        const fileUrl =
          attachment.file_url ||
          (typeof attachment.file === "string" ? attachment.file : null);
        const fileName = attachment.file_name || "File";
        const fileExt = getFileExtension(fileName);
        const fileSize = formatFileSize(attachment.file_size);

        if (!fileUrl) return null;

        return (
          <Pressable
            key={attachment.id ?? idx}
            onPress={() => Linking.openURL(fileUrl)}
            className="flex-row items-center bg-white border border-slate-200 rounded-lg p-2.5 active:bg-slate-50"
          >
            {/* File Type Badge */}
            <View className="w-10 h-10 rounded-lg bg-slate-100 items-center justify-center mr-3">
              <Text className="text-xs font-bold text-slate-500">
                {fileExt || "FILE"}
              </Text>
            </View>

            {/* File Info */}
            <View className="flex-1 mr-2">
              <Text
                className="text-sm font-medium text-slate-700"
                numberOfLines={1}
              >
                {fileName}
              </Text>
              <View className="flex-row items-center gap-2 mt-0.5">
                {fileSize && (
                  <Text className="text-xs text-slate-400">{fileSize}</Text>
                )}
                {attachment.description && (
                  <Text className="text-xs text-slate-400" numberOfLines={1}>
                    {attachment.description}
                  </Text>
                )}
              </View>
            </View>

            {/* Download indicator */}
            <View className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 items-center justify-center">
              <Text className="text-slate-400 text-xs">↓</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

export { AttachmentsList };
export type { Attachment, AttachmentsListProps };
