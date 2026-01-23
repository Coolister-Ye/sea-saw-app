import { useCallback, useEffect, useState } from "react";
import i18n from '@/locale/i18n';
import { View } from "react-native";
import { Button, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";

import { FormDef } from "@/hooks/useFormDefs";

/* ========================
 * Types
 * ======================== */
interface Attachment {
  id?: number;
  file?: File;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  description?: string;
}

interface AttachmentInputProps {
  def?: FormDef;
  value?: Attachment[];
  onChange?: (attachments: Attachment[]) => void;
}

/* ========================
 * AttachmentInput Component
 * ======================== */
export default function AttachmentInput({
  def,
  value = [],
  onChange,
}: AttachmentInputProps) {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  /* ========================
   * Initialize FileList from Value
   * ======================== */
  useEffect(() => {
    if (!value || value.length === 0) {
      setFileList([]);
      return;
    }

    const newFileList: UploadFile[] = value.map((attachment, index) => {
      // Existing attachment with ID (from server)
      if (attachment.id && attachment.file_url) {
        return {
          uid: `${attachment.id}`,
          name: attachment.file_name || `file-${index}`,
          status: "done",
          url: attachment.file_url,
          size: attachment.file_size,
        };
      }
      // New attachment with File object (pending upload)
      else if (attachment.file) {
        return {
          uid: `new-${index}`,
          name: attachment.file.name,
          status: "done",
          originFileObj: attachment.file as any,
          size: attachment.file.size,
        };
      }
      return {
        uid: `unknown-${index}`,
        name: attachment.file_name || `file-${index}`,
        status: "done",
      };
    });

    setFileList(newFileList);
  }, [value]);

  /* ========================
   * File Upload Handler
   * ======================== */
  const handleChange: UploadProps["onChange"] = useCallback(
    (info: any) => {
      const { fileList: newFileList } = info;
      setFileList(newFileList);

      // Convert fileList to Attachment array
      const attachments: Attachment[] = newFileList.map((file: UploadFile) => {
        // If it's a new file being uploaded
        if (file.originFileObj) {
          return {
            file: file.originFileObj as File,
            file_name: file.name,
            file_size: file.size,
          };
        }
        // If it's an existing file from server
        else if (file.url) {
          return {
            id: parseInt(file.uid) || undefined,
            file_url: file.url,
            file_name: file.name,
            file_size: file.size,
            // Important: Do NOT include 'file' field for existing attachments
          };
        }
        // Fallback (should not happen in normal flow)
        return {
          file_name: file.name,
          file_size: file.size,
        };
      });

      onChange?.(attachments);
    },
    [onChange]
  );

  /* ========================
   * Render
   * ======================== */
  return (
    <View>
      <Upload
        fileList={fileList}
        onChange={handleChange}
        beforeUpload={() => false} // Prevent auto-upload
        multiple
      >
        <Button icon={<UploadOutlined />}>{i18n.t("Click to Upload")}</Button>
      </Upload>
    </View>
  );
}
