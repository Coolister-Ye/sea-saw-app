import React, { useMemo, useState } from "react";
import i18n from '@/locale/i18n';
import { Dropdown, MenuProps, Button, Space, message } from "antd";
import useDataService from "@/hooks/useDataService";

interface Props {
  pipelineId: string | number;
  stateActions: string[];
  statusDef?: { choices?: Array<{ value: string; label: string }> };
  onSuccess?: (data: any) => void;
}

export default function PipelineStatusDropdown({
  pipelineId,
  stateActions,
  statusDef,
  onSuccess,
}: Props) {
  const { request } = useDataService();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);

  const statusLabelMap = useMemo(() => {
    if (!statusDef?.choices) return {};
    return Object.fromEntries(
      statusDef.choices.map(({ value, label }) => [value, label])
    );
  }, [statusDef?.choices]);

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
        uri: "pipelineStatusTransition",
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

  const menuProps: MenuProps = useMemo(
    () => ({
      items: stateActions.map((action) => ({
        key: action,
        label: statusLabelMap[action] || i18n.t(action),
      })),
      onClick: ({ key }) => handleAction(key),
    }),
    [stateActions, statusLabelMap],
  );

  if (!stateActions.length) return null;

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
