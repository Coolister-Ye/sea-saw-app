import { useState, useCallback } from "react";
import { Popover } from "antd";
import Tag from "@/components/sea-saw-design/tag";
import i18n from "@/locale/i18n";
import {
  ORDER_TAG_STYLE,
  ORDER_TAG_LABEL_STYLE,
  ETA_TAG_COLOR,
  ETA_STATUS_LABEL,
  getEtaStatus,
  type EtaOrderEntry,
} from "./types";
import { OrderPopoverContent } from "./OrderPopoverContent.web";
import { usePipelineTimestamps } from "./usePipelineTimestamps";

export function EtaOrderTag({
  entry,
  onOrderClick,
}: {
  entry: EtaOrderEntry;
  onOrderClick: () => void;
}) {
  const [open, setOpen] = useState(false);
  const { timestamps, loading, fetchOnOpen } = usePipelineTimestamps(entry.pipeline_id);

  const etaStatus = getEtaStatus(entry.eta, entry.pipeline_status);
  const { etaClassName, badge: badgeColor } = ETA_TAG_COLOR[etaStatus];

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
          accountName={entry.account_name}
          badge={<Tag color={badgeColor as any}>{i18n.t(ETA_STATUS_LABEL[etaStatus])}</Tag>}
          subtitle={entry.outbound_code}
          etd={entry.etd}
          eta={entry.eta}
          etaClassName={etaClassName}
          warning={etaStatus === "overdue" ? i18n.t("Update Pipeline Status") : undefined}
          pipelineCode={entry.pipeline_code}
          pipelineStatus={entry.pipeline_status}
          timestamps={timestamps}
          loading={loading}
        />
      }
      title={entry.order_code}
      trigger="hover"
      placement="right"
      mouseEnterDelay={0.3}
      destroyOnHidden
    >
      <span>
        <Tag
          color={badgeColor as any}
          style={ORDER_TAG_STYLE as any}
          labelStyle={ORDER_TAG_LABEL_STYLE as any}
          onPress={onOrderClick}
        >
          {entry.order_code}
        </Tag>
      </span>
    </Popover>
  );
}
