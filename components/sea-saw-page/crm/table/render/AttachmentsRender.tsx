import React, { memo } from "react";
import type { CustomCellRendererProps } from "ag-grid-react";
import { Text } from "react-native";

interface Attachment {
  id?: string | number;
  file?: string;
  file_url?: string;
  file_name?: string;
  [key: string]: any;
}

function AttachmentsRender(props: CustomCellRendererProps<Attachment[]>) {
  const attachments = Array.isArray(props.value) ? props.value : [];

  if (attachments.length === 0) {
    return null;
  }

  const fileCount = attachments.length;
  const text = fileCount === 1 ? "1 file" : `${fileCount} files`;

  return (
    <Text className="text-sm text-gray-600" numberOfLines={1}>
      {text}
    </Text>
  );
}

export default memo(AttachmentsRender);
export { AttachmentsRender };
