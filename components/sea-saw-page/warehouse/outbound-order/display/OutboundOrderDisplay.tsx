import React, { useMemo, useState, useCallback, useRef } from "react";
import i18n from "@/locale/i18n";
import { View, ScrollView } from "react-native";
import { Button, message } from "antd";

import useDataService from "@/hooks/useDataService";
import { devError } from "@/utils/logger";
import { canEditOutboundOrder } from "@/constants/PipelineStatus";
import { Drawer, SectionContainer } from "@/components/sea-saw-page/base";
import OutboundOrderCard from "./OutboundOrderCard";
import OutboundOrderInput from "../input/OutboundOrderInput";
import PipelineDisplay from "@/components/sea-saw-page/pipeline/display/PipelineDisplay";
import { pickFormDef, filterFormDefs } from "@/utils/formDefUtils";
import type { PipelineDefs } from "@/components/sea-saw-page/pipeline/display/types";
import { OutboundOrderDisplayProps } from "./types";

const EXCLUDED_FIELDS = ["allowed_actions"];

/**
 * OutboundOrderDisplay - Standalone Outbound Order View
 *
 * Displays Outbound Order information with embedded Pipeline access.
 * Uses OutboundOrderCard for display and OutboundOrderInput for editing.
 */
export default function OutboundOrderDisplay({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  def = [],
  data,
  columnOrder,
}: OutboundOrderDisplayProps) {
  const { getViewSet } = useDataService();
  const pipelineViewSet = useMemo(() => getViewSet("pipeline"), [getViewSet]);
  const pipelineMetaLoadedRef = useRef(false);

  const outboundOrder = data ?? {};
  const hasPipeline = Boolean(outboundOrder.related_pipeline?.id);

  const canEdit = hasPipeline
    ? canEditOutboundOrder(
        outboundOrder.related_pipeline?.status ?? "",
        outboundOrder.related_pipeline?.active_entity ?? "",
      )
    : !["completed", "cancelled"].includes(outboundOrder.status);

  const [isPipelineOpen, setIsPipelineOpen] = useState(false);
  const [pipelineData, setPipelineData] = useState<any>(null);
  const [pipelineMeta, setPipelineMeta] = useState<any>({});
  const [editingOutboundOrder, setEditingOutboundOrder] = useState<any>(null);

  const baseDef = useMemo(
    () => def.filter((d) => !EXCLUDED_FIELDS.includes(d.field as any)),
    [def],
  );

  const pipelineCategorizedDefs = useMemo((): PipelineDefs => {
    const formDefs = Object.entries(pipelineMeta).map(
      ([field, meta]: [string, any]) => ({ field, ...meta }),
    );
    const PIPELINE_EXCLUDED = [
      "order",
      "production_orders",
      "purchase_orders",
      "outbound_orders",
      "payments",
      "allowed_actions",
    ];
    return {
      base: filterFormDefs(formDefs, PIPELINE_EXCLUDED),
      orders: pickFormDef(formDefs, "order"),
      productionOrders: pickFormDef(formDefs, "production_orders"),
      purchaseOrders: pickFormDef(formDefs, "purchase_orders"),
      outboundOrders: pickFormDef(formDefs, "outbound_orders"),
      payments: pickFormDef(formDefs, "payments"),
    };
  }, [pipelineMeta]);

  const fetchPipelineMeta = useCallback(async () => {
    if (pipelineMetaLoadedRef.current) return;
    try {
      const res = await pipelineViewSet.options();
      setPipelineMeta(res?.actions?.POST ?? {});
      pipelineMetaLoadedRef.current = true;
    } catch (err) {
      devError("Failed to load pipeline meta:", err);
    }
  }, [pipelineViewSet]);

  const handleOpenPipeline = useCallback(async () => {
    const pipelineId = outboundOrder.related_pipeline?.id;
    if (!pipelineId) return;

    try {
      await fetchPipelineMeta();
      const pipelineDetail = await pipelineViewSet.retrieve({ id: pipelineId });
      setPipelineData(pipelineDetail);
      setIsPipelineOpen(true);
    } catch (err: any) {
      devError("Failed to load pipeline:", err);
      message.error(i18n.t("Failed to load pipeline details"));
    }
  }, [outboundOrder.related_pipeline?.id, fetchPipelineMeta, pipelineViewSet]);

  const handleClosePipeline = useCallback(() => {
    setIsPipelineOpen(false);
    setPipelineData(null);
  }, []);

  const handlePipelineUpdate = useCallback((res?: any) => {
    const updated = res?.data ?? res;
    if (updated) setPipelineData(updated);
  }, []);

  const handleUpdateSuccess = useCallback(
    (res?: any) => {
      setEditingOutboundOrder(null);
      onUpdate?.(res);
    },
    [onUpdate],
  );

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title={i18n.t("Outbound Order Details")}
      footer={
        <View className="flex-row justify-end p-2 gap-2">
          <Button onClick={onClose}>{i18n.t("Close")}</Button>
        </View>
      }
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <SectionContainer
          title={i18n.t("Outbound Order Information")}
          contentClassName="border-none"
        >
          <OutboundOrderCard
            def={baseDef}
            value={[outboundOrder]}
            canEdit={canEdit}
            onItemClick={() => setEditingOutboundOrder(outboundOrder)}
            onPipelineClick={hasPipeline ? handleOpenPipeline : undefined}
            hideEmptyFields
          />
          <OutboundOrderInput
            mode="standalone"
            isOpen={!!editingOutboundOrder}
            def={baseDef}
            data={editingOutboundOrder ?? {}}
            columnOrder={columnOrder}
            onClose={() => setEditingOutboundOrder(null)}
            onCreate={onCreate}
            onUpdate={handleUpdateSuccess}
          />
        </SectionContainer>
      </ScrollView>

      {isPipelineOpen && (
        <PipelineDisplay
          isOpen
          defs={pipelineCategorizedDefs}
          data={pipelineData}
          onClose={handleClosePipeline}
          onCreate={handlePipelineUpdate}
          onUpdate={handlePipelineUpdate}
        />
      )}
    </Drawer>
  );
}
