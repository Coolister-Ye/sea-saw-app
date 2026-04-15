import React, { useCallback, useMemo, useState } from "react";
import i18n from '@/locale/i18n';
import { Dropdown, MenuProps, Button, Space, message, Modal } from "antd";
import useDataService from "@/hooks/useDataService";
import {
  CLOSED_SUB_ENTITY_STATUSES,
  TRANSITION_ENTITY_CHECK,
} from "@/constants/PipelineStatus";

interface SubEntityItem {
  id: string | number;
  status: string;
}

interface Props {
  pipelineId: string | number;
  stateActions: string[];
  statusDef?: { choices?: Array<{ value: string; label: string }> };
  purchaseOrders?: SubEntityItem[];
  productionOrders?: SubEntityItem[];
  outboundOrders?: SubEntityItem[];
  onSuccess?: (data: any) => void;
}

const ENTITY_KEY_TO_URI: Record<string, string> = {
  purchase_orders: "purchaseOrder",
  production_orders: "productionOrder",
  outbound_orders: "outboundOrder",
};

export default function PipelineStatusDropdown({
  pipelineId,
  stateActions,
  statusDef,
  purchaseOrders,
  productionOrders,
  outboundOrders,
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

  const doTransition = useCallback(async (action: string) => {
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
  }, [pipelineId, request, messageApi, onSuccess]);

  const closeOpenOrders = useCallback(async (action: string) => {
    const entityKeys = TRANSITION_ENTITY_CHECK[action];
    if (!entityKeys) return;

    const entityDataMap: Record<string, SubEntityItem[]> = {
      purchase_orders: purchaseOrders ?? [],
      production_orders: productionOrders ?? [],
      outbound_orders: outboundOrders ?? [],
    };

    const patches: Promise<any>[] = [];
    for (const key of entityKeys) {
      const uri = ENTITY_KEY_TO_URI[key];
      if (!uri) continue;
      const openOrders = (entityDataMap[key] ?? []).filter(
        (o) => !CLOSED_SUB_ENTITY_STATUSES.includes(o.status),
      );
      for (const order of openOrders) {
        patches.push(request({ uri, method: "PATCH", id: order.id, body: { status: "completed" } }));
      }
    }

    await Promise.all(patches);
  }, [purchaseOrders, productionOrders, outboundOrders, request]);

  const getOpenEntityWarning = useCallback((action: string): string | null => {
    const entityKeys = TRANSITION_ENTITY_CHECK[action];
    if (!entityKeys) return null;

    const entityDataMap: Record<string, Array<{ status: string }>> = {
      purchase_orders: purchaseOrders ?? [],
      production_orders: productionOrders ?? [],
      outbound_orders: outboundOrders ?? [],
    };

    const warnings: string[] = [];
    for (const key of entityKeys) {
      const orders = entityDataMap[key] ?? [];
      const openCount = orders.filter(
        (o) => !CLOSED_SUB_ENTITY_STATUSES.includes(o.status)
      ).length;
      if (openCount > 0) {
        warnings.push(`${openCount} ${i18n.t(key)} ${i18n.t("not yet closed")}`);
      }
    }
    return warnings.length > 0 ? warnings.join(", ") : null;
  }, [purchaseOrders, productionOrders, outboundOrders]);

  const handleAction = useCallback((action: string) => {
    const warning = getOpenEntityWarning(action);
    if (warning) {
      Modal.confirm({
        title: i18n.t("Some orders are not yet closed"),
        content: `${warning}. ${i18n.t("Proceeding will automatically mark them as completed. Are you sure you want to proceed?")}`,
        okText: i18n.t("Proceed"),
        cancelText: i18n.t("Cancel"),
        onOk: async () => {
          await closeOpenOrders(action);
          await doTransition(action);
        },
      });
    } else {
      doTransition(action);
    }
  }, [getOpenEntityWarning, closeOpenOrders, doTransition]);

  const menuProps: MenuProps = useMemo(
    () => ({
      items: stateActions.map((action) => ({
        key: action,
        label: statusLabelMap[action] || i18n.t(action),
      })),
      onClick: ({ key }) => handleAction(key),
    }),
    [stateActions, statusLabelMap, handleAction],
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
