import React from "react";
import { View, Text } from "react-native";
import FileDisplay from "@/components/sea-saw-design/form/FileDisplay";

/* ========================
 * Types
 * ======================== */
interface Attachment {
  id: number;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  description?: string;
}

interface AttachmentsDisplayProps {
  value?: Attachment[] | null;
  def?: any;
}

/* ========================
 * Attachments Display Component
 * ======================== */
export default function AttachmentsDisplay({ value }: AttachmentsDisplayProps) {
  console.log("AttachmentsDisplay", value);
  if (!value || !Array.isArray(value) || value.length === 0) {
    return <Text>-</Text>;
  }

  return (
    <View className="flex gap-2">
      {value.map((attachment) => {
        // Extract URL - handle both file_url field and legacy cases
        const url =
          attachment.file_url ||
          (typeof (attachment as any).file === "string"
            ? (attachment as any).file
            : null);

        if (!url) {
          return null; // Skip attachments without valid URL
        }

        return (
          <FileDisplay
            key={attachment.id}
            value={{
              url: url,
              name: attachment.file_name,
              filename: attachment.file_name,
            }}
          />
        );
      })}
    </View>
  );
}
