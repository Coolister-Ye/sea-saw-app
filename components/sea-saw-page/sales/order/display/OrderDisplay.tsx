import React, { useMemo, useState, useCallback, useRef } from "react";
import i18n from "@/locale/i18n";
import { View, ScrollView } from "react-native";
import { Button, message } from "antd";
import { PlusOutlined, InfoCircleOutlined } from "@ant-design/icons";

import useDataService from "@/hooks/useDataService";
import { devError } from "@/utils/logger";
import { Text } from "@/components/sea-saw-design/text";
import { OrderDisplayProps } from "./types";
import { Drawer, SectionContainer } from "@/components/sea-saw-page/base";
import OrderCard from "./OrderCard";
import OrderInput from "../input/OrderInput";
import PipelineDisplay from "@/components/sea-saw-page/pipeline/display/PipelineDisplay";
import PipelineTypeModal from "../input/PipelineTypeModal";
import { pickFormDef, filterFormDefs } from "@/utils/formDefUtils";
import type { PipelineDefs } from "@/components/sea-saw-page/pipeline/display/types";

/**
 * OrderDisplay - Standalone Order View
 *
 * Displays Order information with embedded Pipeline access.
 *
 * Features:
 * - Display and edit Order basic information via OrderCard
 * - Create Pipeline button for orders without pipeline
 * - Click on related_pipeline to open PipelineDisplay
 */
export default function OrderDisplay({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  onPipelineCreated,
  onPipelineUpdate,
  def = [],
  data,
}: OrderDisplayProps) {
  const { request, getViewSet } = useDataService();
  const pipelineViewSet = useMemo(() => getViewSet("pipeline"), [getViewSet]);
  const pipelineMetaLoadedRef = useRef(false);

  const order = data ?? {};
  const hasPipeline = Boolean(order.related_pipeline?.id);

  const [creatingPipeline, setCreatingPipeline] = useState(false);
  const [pipelineTypeModalOpen, setPipelineTypeModalOpen] = useState(false);

  // Pipeline display state
  const [isPipelineOpen, setIsPipelineOpen] = useState(false);
  const [pipelineData, setPipelineData] = useState<any>(null);
  const [pipelineMeta, setPipelineMeta] = useState<any>({});
  const [loadingPipeline, setLoadingPipeline] = useState(false);

  // Convert pipeline meta to FormDef[] and categorize
  const pipelineCategorizedDefs = useMemo((): PipelineDefs => {
    const formDefs = Object.entries(pipelineMeta).map(
      ([field, meta]: [string, any]) => ({
        field,
        ...meta,
      }),
    );

    const EXCLUDED_FIELDS = [
      "order",
      "production_orders",
      "purchase_orders",
      "outbound_orders",
      "payments",
      "allowed_actions",
    ];

    return {
      base: filterFormDefs(formDefs, EXCLUDED_FIELDS),
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
    const pipelineId = order.related_pipeline?.id;
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
  }, [order.related_pipeline?.id, fetchPipelineMeta, pipelineViewSet]);

  const handleClosePipeline = useCallback(() => {
    setIsPipelineOpen(false);
    setPipelineData(null);
  }, []);

  const handlePipelineUpdate = useCallback((res?: any) => {
    const updated = res?.data ?? res;
    if (updated) {
      setPipelineData(updated);
      // Notify parent that pipeline was updated (e.g., status change)
      onPipelineUpdate?.(updated);
    }
  }, [onPipelineUpdate]);

  const [editingOrder, setEditingOrder] = useState<any>(null);

  const handleOpenPipelineTypeModal = useCallback(() => {
    setPipelineTypeModalOpen(true);
  }, []);

  const handleClosePipelineTypeModal = useCallback(() => {
    setPipelineTypeModalOpen(false);
  }, []);

  const handleCreatePipeline = useCallback(
    async (pipelineType: string) => {
      if (!order.id) return;

      setCreatingPipeline(true);
      try {
        const response = await request({
          uri: "order",
          id: order.id,
          suffix: "create_pipeline/",
          method: "POST",
          body: { pipeline_type: pipelineType },
        });
        message.success(i18n.t("Pipeline created successfully"));
        setPipelineTypeModalOpen(false);
        onPipelineCreated?.(response);
      } catch (err: any) {
        devError("Failed to create pipeline:", err);
        message.error(
          err?.response?.data?.error ||
            err?.message ||
            i18n.t("Failed to create pipeline"),
        );
      } finally {
        setCreatingPipeline(false);
      }
    },
    [order.id, request, onPipelineCreated],
  );

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title={i18n.t("Order Details")}
      footer={
        <View className="flex-row justify-end p-2 gap-2">
          {!hasPipeline && order.id && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenPipelineTypeModal}
            >
              {i18n.t("Create Pipeline")}
            </Button>
          )}
          <Button onClick={onClose}>{i18n.t("Close")}</Button>
        </View>
      }
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <SectionContainer
          title={i18n.t("Order Information")}
          contentClassName="border-none"
        >
          <OrderCard
            def={def}
            value={[order]}
            onItemClick={() => setEditingOrder(order)}
            onPipelineClick={handleOpenPipeline}
            hideEmptyFields
          />
          <OrderInput
            isOpen={!!editingOrder}
            def={def}
            data={editingOrder ?? {}}
            onClose={() => setEditingOrder(null)}
            onCreate={onCreate}
            onUpdate={onUpdate}
          />
        </SectionContainer>

        {!hasPipeline && order.id && (
          <View className="p-4 bg-blue-50 rounded-lg flex-row items-start gap-2">
            <InfoCircleOutlined style={{ color: "#1e40af", marginTop: 2 }} />
            <Text className="text-blue-800 text-sm flex-1">
              {i18n.t(
                "This order has no pipeline yet. Create a pipeline to start the workflow and manage production, procurement, and payments.",
              )}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Pipeline Display - opens when clicking on related_pipeline */}
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

      {/* Pipeline Type Selection Modal */}
      <PipelineTypeModal
        open={pipelineTypeModalOpen}
        loading={creatingPipeline}
        onConfirm={handleCreatePipeline}
        onCancel={handleClosePipelineTypeModal}
      />
    </Drawer>
  );
}
