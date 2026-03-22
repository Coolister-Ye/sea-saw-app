import { useCallback } from "react";
import i18n from "@/locale/i18n";
import { Modal, message } from "antd";
import type { MessageInstance } from "antd/es/message/interface";

export interface UseEntityDeleteOptions {
  /** 是否启用删除功能，默认 false */
  enabled?: boolean;
  /** 删除确认框中显示的名称字段 */
  nameField?: string;
  /** 当前正在查看的行（用于删除后关闭 view drawer） */
  viewRow?: any;
  /** 删除成功后的回调，传入被删除行的 id */
  onDeleteSuccess?: (id: number) => void;
}

export interface UseEntityDeleteReturn {
  openDelete: () => void;
  messageApi: MessageInstance;
  contextHolder: React.ReactElement;
}

export function useEntityDelete(
  viewSet: any,
  tableRef: React.RefObject<any>,
  gridApiRef: React.RefObject<any>,
  options?: UseEntityDeleteOptions,
): UseEntityDeleteReturn {
  const {
    enabled = false,
    nameField = "name",
    viewRow,
    onDeleteSuccess,
  } = options ?? {};

  const [messageApi, contextHolder] = message.useMessage();

  const openDelete = useCallback(() => {
    if (!enabled) return;

    const node = gridApiRef.current?.getSelectedNodes?.()[0];
    if (!node?.data) return;

    const displayName = node.data[nameField] || `ID: ${node.data.id}`;

    Modal.confirm({
      title: i18n.t("Are you sure to delete?"),
      content: `${i18n.t(nameField)}: ${displayName}`,
      okText: i18n.t("Delete"),
      okType: "danger",
      cancelText: i18n.t("Cancel"),
      onOk: async () => {
        try {
          messageApi.open({
            key: "delete",
            type: "loading",
            content: i18n.t("Deleting..."),
            duration: 0,
          });

          await viewSet.delete({ id: node.data.id });

          messageApi.open({
            key: "delete",
            type: "success",
            content: i18n.t("Delete successfully"),
          });

          tableRef.current?.api?.refreshServerSide();
          onDeleteSuccess?.(node.data.id);
        } catch (err: any) {
          console.error("Delete failed:", err);
          messageApi.open({
            key: "delete",
            type: "error",
            content:
              err?.message ||
              err?.response?.data?.message ||
              i18n.t("Delete failed"),
          });
        }
      },
    });
  }, [enabled, nameField, viewSet, gridApiRef, tableRef, messageApi, onDeleteSuccess]);

  return { openDelete, messageApi, contextHolder };
}
