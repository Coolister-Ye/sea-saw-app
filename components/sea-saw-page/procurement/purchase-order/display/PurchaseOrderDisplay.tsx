import React, { useMemo, useState, useCallback, useRef } from "react";
import i18n from "@/locale/i18n";
import { View, ScrollView } from "react-native";
import { Button } from "antd";

import useDataService from "@/hooks/useDataService";
import { devError } from "@/utils/logger";
import { message } from "antd";
import { PurchaseOrderDisplayProps } from "./types";
import { Drawer, SectionContainer } from "@/components/sea-saw-page/base";
import PurchaseOrderCard from "./PurchaseOrderCard";
import PurchaseOrderInput from "../input/PurchaseOrderInput";
import PipelineDisplay from "@/components/sea-saw-page/pipeline/display/PipelineDisplay";
import { pickFormDef, filterFormDefs } from "@/utils/formDefUtils";
import { PipelineStatus, SubEntityStatus } from "@/constants/PipelineStatus";
import type { PipelineDefs } from "@/components/sea-saw-page/pipeline/display/types";

const EXCLUDED_FIELDS = ["allowed_actions"];

/**
 * PurchaseOrderDisplay - Standalone Purchase Order View
 *
 * Mirrors OrderDisplay pattern: uses PurchaseOrderCard for display,
 * PurchaseOrderInput for editing, PipelineDisplay for pipeline access.
 */
export default function PurchaseOrderDisplay({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  def = [],
  data,
}: PurchaseOrderDisplayProps) {
  const { getViewSet } = useDataService();
  const pipelineViewSet = useMemo(() => getViewSet("pipeline"), [getViewSet]);
  const pipelineMetaLoadedRef = useRef(false);

  const purchaseOrder = data ?? {};
  const hasPipeline = Boolean(purchaseOrder.related_pipeline?.id);
  const pipelineStatus = purchaseOrder.related_pipeline?.status as string | undefined;

  const canEdit = hasPipeline
    ? pipelineStatus === PipelineStatus.IN_PURCHASE ||
      pipelineStatus === PipelineStatus.IN_PURCHASE_AND_PRODUCTION
    : purchaseOrder.status !== SubEntityStatus.COMPLETED &&
      purchaseOrder.status !== SubEntityStatus.CANCELLED;

  // Pipeline display state
  const [isPipelineOpen, setIsPipelineOpen] = useState(false);
  const [pipelineData, setPipelineData] = useState<any>(null);
  const [pipelineMeta, setPipelineMeta] = useState<any>({});
  const [loadingPipeline, setLoadingPipeline] = useState(false);

  const [editingPurchaseOrder, setEditingPurchaseOrder] = useState<any>(null);

  const baseDef = useMemo(
    () => def.filter((d) => !EXCLUDED_FIELDS.includes(d.field as any)),
    [def],
  );

  // Convert pipeline meta to FormDef[] and categorize
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
    const pipelineId = purchaseOrder.related_pipeline?.id;
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
  }, [purchaseOrder.related_pipeline?.id, fetchPipelineMeta, pipelineViewSet]);

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
      setEditingPurchaseOrder(null);
      onUpdate?.(res);
    },
    [onUpdate],
  );

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title={i18n.t("Purchase Order Details")}
      footer={
        <View className="flex-row justify-end p-2 gap-2">
          <Button onClick={onClose}>{i18n.t("Close")}</Button>
        </View>
      }
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <SectionContainer
          title={i18n.t("Purchase Order Information")}
          contentClassName="border-none"
        >
          <PurchaseOrderCard
            def={baseDef}
            value={[purchaseOrder]}
            canEdit={canEdit}
            onItemClick={() => setEditingPurchaseOrder(purchaseOrder)}
            onPipelineClick={handleOpenPipeline}
            pipelineLoading={loadingPipeline}
            hideEmptyFields
          />
          <PurchaseOrderInput
            isOpen={!!editingPurchaseOrder}
            def={baseDef}
            data={editingPurchaseOrder ?? {}}
            onClose={() => setEditingPurchaseOrder(null)}
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
