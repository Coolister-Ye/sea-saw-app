import { useState, useCallback } from "react";
import { Popover } from "antd";
import Tag from "@/components/sea-saw-design/tag";
import i18n from "@/locale/i18n";
import {
  TAG_COLOR,
  ORDER_TAG_STYLE,
  ORDER_TAG_LABEL_STYLE,
  STATUS_LABEL,
  type OrderEntry,
} from "./types";
import { OrderPopoverContent } from "./OrderPopoverContent.web";
import { usePipelineTimestamps } from "./usePipelineTimestamps";

export function EtdOrderTag({
  order,
  onOrderClick,
}: {
  order: OrderEntry;
  onOrderClick: () => void;
}) {
  const [open, setOpen] = useState(false);
  const { timestamps, loading, fetchOnOpen } = usePipelineTimestamps(order.pipeline_id);

  const handleOpenChange = useCallback(
    async (visible: boolean) => {
      setOpen(visible);
      await fetchOnOpen(visible);
    },
    [fetchOnOpen],
  );

  return (
    <Popover
      open={open}
      onOpenChange={handleOpenChange}
      content={
        <OrderPopoverContent
          accountName={order.account_name}
          badge={
            <Tag color={TAG_COLOR[order.shipping_status]}>
              {i18n.t(STATUS_LABEL[order.shipping_status])}
            </Tag>
          }
          subtitle={order.total_amount}
          etd={order.etd}
          eta={order.eta}
          pipelineCode={order.pipeline_code}
          pipelineStatus={order.pipeline_status}
          timestamps={timestamps}
          loading={loading}
        />
      }
      title={order.order_code}
      trigger="hover"
      placement="right"
      mouseEnterDelay={0.3}
      destroyOnHidden
    >
      <span>
        <Tag
          color={TAG_COLOR[order.shipping_status]}
          style={ORDER_TAG_STYLE as any}
          labelStyle={ORDER_TAG_LABEL_STYLE as any}
          onPress={onOrderClick}
        >
          {order.order_code}
        </Tag>
      </span>
    </Popover>
  );
}
