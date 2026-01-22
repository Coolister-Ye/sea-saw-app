import React, { useMemo, useState } from "react";
import { Dropdown, MenuProps, Button, Space, message } from "antd";
import { useLocale } from "@/context/Locale";
import useDataService from "@/hooks/useDataService";

interface Props {
  pipelineId: string | number;
  stateActions: string[];
  onSuccess?: (data: any) => void;
}

export default function PipelineStatusDropdown({
  pipelineId,
  stateActions,
  onSuccess,
}: Props) {
  const { i18n } = useLocale();
  const { request } = useDataService();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);

  /* =========================
   * Click handler
   * ========================= */
  const handleAction = async (action: string) => {
    try {
      setLoading(true);
      messageApi.open({
        key: "status-update",
        type: "loading",
        content: i18n.t("Updating pipeline status..."),
        duration: 0,
      });

      const data = await request({
        uri: "pipelineStatusTransition", // 映射到 /pipelines/{id}/transition/
        method: "POST",
        id: pipelineId,
        body: {
          target_status: action,
        },
      });

      messageApi.open({
        key: "status-update",
        type: "success",
        content: i18n.t("Pipeline status updated successfully"),
        duration: 2,
      });

      onSuccess?.(data);
    } catch (e: any) {
      messageApi.open({
        key: "status-update",
        type: "error",
        content: e?.message || i18n.t("Failed to update pipeline status"),
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  /* =========================
   * Menu items
   * ========================= */
  const menuProps: MenuProps = useMemo(
    () => ({
      items: stateActions.map((action) => ({
        key: action,
        label: i18n.t(action),
      })),
      onClick: ({ key }) => handleAction(key),
    }),
    [stateActions, i18n],
  );

  if (!stateActions.length) return null;

  /* =========================
   * Render
   * ========================= */
  return (
    <>
      {contextHolder}

      <Space.Compact>
        <Dropdown menu={menuProps} placement="bottomRight" disabled={loading}>
          <Button type="primary" loading={loading}>
            {i18n.t("Change pipeline status")}
          </Button>
        </Dropdown>
      </Space.Compact>
    </>
  );
}
