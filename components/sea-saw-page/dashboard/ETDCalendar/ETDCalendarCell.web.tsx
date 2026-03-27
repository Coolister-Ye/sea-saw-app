import { useCallback, useMemo, useState } from "react";
import { Popover, Tag as AntTag } from "antd";
import useDataService from "@/hooks/useDataService";
import {
  PipelineTimeline,
  type PipelineTimestamps,
} from "@/components/sea-saw-page/pipeline/display/renderers/PipelineTimeline";
import {
  ANT_STATUS_COLOR,
  ORDER_TAG_STYLE,
  STATUS_LABEL,
  type EtaOrderEntry,
  type OrderEntry,
} from "./types";

// ---------------------------------------------------------------------------
// OrderPopoverContent — static summary shown above the timeline
// ---------------------------------------------------------------------------

function OrderPopoverContent({
  order,
  timestamps,
  loading,
}: {
  order: OrderEntry;
  timestamps?: PipelineTimestamps;
  loading: boolean;
}) {
  return (
    <div style={{ width: 210, padding: "4px 0" }}>
      {/* Header: account + amount */}
      <div style={{ marginBottom: 6 }}>
        <span style={{ fontWeight: 600, fontSize: 13 }}>{order.account_name}</span>
        <span style={{ color: "#8c8c8c", fontSize: 12, marginLeft: 6 }}>
          {order.total_amount}
        </span>
      </div>

      {/* Shipping status badge */}
      <div style={{ marginBottom: 10 }}>
        <AntTag
          color={ANT_STATUS_COLOR[order.shipping_status]}
          style={{ fontSize: 11 }}
        >
          {STATUS_LABEL[order.shipping_status]}
        </AntTag>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "#f0f0f0", marginBottom: 10 }} />

      {/* ETA */}
      {order.eta && (
        <div style={{ marginBottom: 8, fontSize: 11, color: "#8c8c8c" }}>
          预计到货：<span style={{ color: "#1677ff" }}>{order.eta}</span>
        </div>
      )}

      {/* Pipeline timeline */}
      <PipelineTimeline
        pipelineCode={order.pipeline_code}
        pipelineStatus={order.pipeline_status}
        timestamps={timestamps}
        loading={loading}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// OrderPopoverItem — one tag + its lazy-loaded popover
// ---------------------------------------------------------------------------

function OrderPopoverItem({
  order,
  onOrderClick,
}: {
  order: OrderEntry;
  onOrderClick: () => void;
}) {
  const { getViewSet } = useDataService();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const pipelineViewSet = useMemo(() => getViewSet("pipeline"), [getViewSet]);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timestamps, setTimestamps] = useState<PipelineTimestamps | undefined>(
    undefined
  );

  const handleOpenChange = useCallback(
    async (visible: boolean) => {
      setOpen(visible);
      // Only fetch once, only when pipeline_id is available, only when opening
      if (!visible || !order.pipeline_id || timestamps !== undefined) return;

      setLoading(true);
      try {
        const data = await pipelineViewSet.retrieve({ id: order.pipeline_id });
        setTimestamps({
          created_at: data?.created_at ?? null,
          confirmed_at: data?.confirmed_at ?? null,
          in_purchase_at: data?.in_purchase_at ?? null,
          purchase_completed_at: data?.purchase_completed_at ?? null,
          in_production_at: data?.in_production_at ?? null,
          production_completed_at: data?.production_completed_at ?? null,
          in_purchase_and_production_at:
            data?.in_purchase_and_production_at ?? null,
          purchase_and_production_completed_at:
            data?.purchase_and_production_completed_at ?? null,
          in_outbound_at: data?.in_outbound_at ?? null,
          outbound_completed_at: data?.outbound_completed_at ?? null,
          completed_at: data?.completed_at ?? null,
          cancelled_at: data?.cancelled_at ?? null,
        });
      } catch {
        // Degrade gracefully — timeline renders without timestamps
        setTimestamps({});
      } finally {
        setLoading(false);
      }
    },
    [order.pipeline_id, pipelineViewSet, timestamps]
  );

  return (
    <Popover
      open={open}
      onOpenChange={handleOpenChange}
      content={
        <OrderPopoverContent
          order={order}
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
      <AntTag
        color={ANT_STATUS_COLOR[order.shipping_status]}
        style={ORDER_TAG_STYLE}
        onClick={onOrderClick}
      >
        {order.order_code}
      </AntTag>
    </Popover>
  );
}

// ---------------------------------------------------------------------------
// EtaPopoverContent — ETA 到货 popover 内容
// ---------------------------------------------------------------------------

function EtaPopoverContent({
  entry,
  timestamps,
  loading,
}: {
  entry: EtaOrderEntry;
  timestamps?: PipelineTimestamps;
  loading: boolean;
}) {
  return (
    <div style={{ width: 210, padding: "4px 0" }}>
      <div style={{ marginBottom: 6 }}>
        <span style={{ fontWeight: 600, fontSize: 13 }}>{entry.account_name}</span>
      </div>
      <div style={{ marginBottom: 10 }}>
        <AntTag color="purple" style={{ fontSize: 11 }}>
          预计到货
        </AntTag>
      </div>
      <div style={{ height: 1, background: "#f0f0f0", marginBottom: 10 }} />
      <div style={{ marginBottom: 8, fontSize: 11, color: "#8c8c8c" }}>
        ETD：<span style={{ color: "#595959" }}>{entry.etd}</span>
      </div>
      <div style={{ marginBottom: 8, fontSize: 11, color: "#8c8c8c" }}>
        ETA：<span style={{ color: "#722ed1" }}>{entry.eta}</span>
      </div>
      <div style={{ marginBottom: 10, fontSize: 11, color: "#8c8c8c" }}>
        出库单：<span style={{ color: "#595959" }}>{entry.outbound_code}</span>
      </div>
      <div style={{ height: 1, background: "#f0f0f0", marginBottom: 10 }} />
      <PipelineTimeline
        pipelineCode={entry.pipeline_code}
        pipelineStatus={entry.pipeline_status}
        timestamps={timestamps}
        loading={loading}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// EtaOrderTag — 到货日标签 + lazy-loaded popover
// ---------------------------------------------------------------------------

function EtaOrderTag({
  entry,
  onOrderClick,
}: {
  entry: EtaOrderEntry;
  onOrderClick: () => void;
}) {
  const { getViewSet } = useDataService();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const pipelineViewSet = useMemo(() => getViewSet("pipeline"), [getViewSet]);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timestamps, setTimestamps] = useState<PipelineTimestamps | undefined>(undefined);

  const handleOpenChange = useCallback(
    async (visible: boolean) => {
      setOpen(visible);
      if (!visible || !entry.pipeline_id || timestamps !== undefined) return;

      setLoading(true);
      try {
        const data = await pipelineViewSet.retrieve({ id: entry.pipeline_id });
        setTimestamps({
          created_at: data?.created_at ?? null,
          confirmed_at: data?.confirmed_at ?? null,
          in_purchase_at: data?.in_purchase_at ?? null,
          purchase_completed_at: data?.purchase_completed_at ?? null,
          in_production_at: data?.in_production_at ?? null,
          production_completed_at: data?.production_completed_at ?? null,
          in_purchase_and_production_at: data?.in_purchase_and_production_at ?? null,
          purchase_and_production_completed_at: data?.purchase_and_production_completed_at ?? null,
          in_outbound_at: data?.in_outbound_at ?? null,
          outbound_completed_at: data?.outbound_completed_at ?? null,
          completed_at: data?.completed_at ?? null,
          cancelled_at: data?.cancelled_at ?? null,
        });
      } catch {
        setTimestamps({});
      } finally {
        setLoading(false);
      }
    },
    [entry.pipeline_id, pipelineViewSet, timestamps]
  );

  return (
    <Popover
      open={open}
      onOpenChange={handleOpenChange}
      content={
        <EtaPopoverContent entry={entry} timestamps={timestamps} loading={loading} />
      }
      title={entry.order_code}
      trigger="hover"
      placement="right"
      mouseEnterDelay={0.3}
      destroyOnHidden
    >
      <AntTag
        style={{
          ...ORDER_TAG_STYLE,
          border: "1px dashed #722ed1",
          background: "transparent",
          color: "#531dab",
          cursor: "pointer",
        }}
        onClick={onOrderClick}
      >
        ↓ {entry.order_code}
      </AntTag>
    </Popover>
  );
}

// ---------------------------------------------------------------------------
// ETDCalendarCell — public export
// ---------------------------------------------------------------------------

type Props = {
  orders: OrderEntry[];
  etaOrders?: EtaOrderEntry[];
  onOrderClick: () => void;
};

export function ETDCalendarCell({ orders, etaOrders = [], onOrderClick }: Props) {
  if (orders.length === 0 && etaOrders.length === 0) return null;
  return (
    <>
      {orders.map((order) => (
        <OrderPopoverItem
          key={order.order_code}
          order={order}
          onOrderClick={onOrderClick}
        />
      ))}
      {etaOrders.map((entry) => (
        <EtaOrderTag
          key={`eta-${entry.outbound_code}`}
          entry={entry}
          onOrderClick={onOrderClick}
        />
      ))}
    </>
  );
}
