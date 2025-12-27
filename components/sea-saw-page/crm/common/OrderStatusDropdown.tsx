import React, { useMemo } from "react";
import { Dropdown, MenuProps, Button, Space, message } from "antd";
import { EllipsisOutlined } from "@ant-design/icons";
import { useLocale } from "@/context/Locale";
import useDataService from "@/hooks/useDataService";

interface Props {
  orderId: string | number;
  stateActions: string[];
  onSuccess?: (data: any) => void;
}

export default function OrderStatusDropdown({
  orderId,
  stateActions,
  onSuccess,
}: Props) {
  const { i18n } = useLocale();
  const { request } = useDataService();
  const [messageApi, contextHolder] = message.useMessage();
  /* =========================
   * Click handler
   * ========================= */
  const handleAction = async (targetStatus: string) => {
    try {
      const data = await request({
        uri: "orderStatusTransition", // 映射到 /orders/{id}/transition/
        method: "POST",
        id: orderId,
        body: {
          target_status: targetStatus,
        },
      });

      messageApi.success(
        i18n.t("Order status updated to {{status}}", {
          status: i18n.t(targetStatus),
        })
      );

      onSuccess?.(data);
    } catch (e: any) {
      messageApi.error(e?.message || i18n.t("Failed to update order status"));
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
    [stateActions, i18n]
  );

  if (!stateActions.length) return null;

  /* =========================
   * Render
   * ========================= */
  return (
    <>
      {contextHolder}

      <Space.Compact>
        <Dropdown menu={menuProps} placement="bottomRight">
          <Button type="primary">{i18n.t("Change Order Status")}</Button>
        </Dropdown>
      </Space.Compact>
    </>
  );
}
