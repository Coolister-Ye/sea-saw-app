import React, { useMemo, useState, useCallback, useRef } from "react";
import i18n from "@/locale/i18n";
import { View, ScrollView } from "react-native";
import { Button, message } from "antd";

import useDataService from "@/hooks/useDataService";
import { devError } from "@/utils/logger";
import { Drawer, SectionContainer } from "@/components/sea-saw-page/base";
import OutboundOrderCard from "./OutboundOrderCard";
import OutboundOrderInput from "../input/nested/OutboundOrderInput";
import PipelineDisplay from "@/components/sea-saw-page/pipeline/display/PipelineDisplay";
import { pickFormDef, filterFormDefs } from "@/utils/formDefUtils";
import type { PipelineDefs } from "@/components/sea-saw-page/pipeline/display/types";

const EXCLUDED_FIELDS = ["allowed_actions"];

interface StandaloneOutboundOrderDisplayProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate?: (res: any) => void;
  onUpdate?: (res: any) => void;
  def?: any[];
  data?: Record<string, any> | null;
  columnOrder?: string[];
}

/**
 * StandaloneOutboundOrderDisplay - Standalone Outbound Order View
 *
 * Mirrors PurchaseOrderDisplay pattern: uses OutboundOrderCard for display,
 * OutboundOrderInput (standalone mode) for editing, PipelineDisplay for pipeline access.
 */
export default function StandaloneOutboundOrderDisplay({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  def = [],
  data,
}: StandaloneOutboundOrderDisplayProps) {
  const { getViewSet } = useDataService();
  const pipelineViewSet = useMemo(() => getViewSet("pipeline"), [getViewSet]);
  const pipelineMetaLoadedRef = useRef(false);

  const outboundOrder = data ?? {};
  const hasPipeline = Boolean(outboundOrder.related_pipeline?.id);

  const [isPipelineOpen, setIsPipelineOpen] = useState(false);
  const [pipelineData, setPipelineData] = useState<any>(null);
  const [pipelineMeta, setPipelineMeta] = useState<any>({});
  const [loadingPipeline, setLoadingPipeline] = useState(false);
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

    setLoadingPipeline(true);
    try {
      await fetchPipelineMeta();
      const pipelineDetail = await pipelineViewSet.retrieve({ id: pipelineId });
      setPipelineData(pipelineDetail);
      setIsPipelineOpen(true);
    } catch (err: any) {
      devError("Failed to load pipeline:", err);
      message.error(i18n.t("Failed to load pipeline details"));
    } finally {
      setLoadingPipeline(false);
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
            canEdit={outboundOrder.status === "draft" || !hasPipeline}
            onItemClick={() => setEditingOutboundOrder(outboundOrder)}
            hideEmptyFields
          />
          <OutboundOrderInput
            mode="standalone"
            isOpen={!!editingOutboundOrder}
            def={baseDef}
            data={editingOutboundOrder ?? {}}
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
