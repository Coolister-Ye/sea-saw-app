import React, { useMemo, useState, useCallback, useRef } from "react";
import i18n from "@/locale/i18n";
import { View, ScrollView, Text } from "react-native";
import { Button, message, Tag, Spin } from "antd";
import { EyeOutlined, InfoCircleOutlined } from "@ant-design/icons";

import useDataService from "@/hooks/useDataService";
import { devError } from "@/utils/logger";
import { OutboundOrderDisplayProps } from "./types";
import {
  Drawer,
  SectionContainer,
  CardMetadata,
  CardSection,
  CardEditButton,
} from "@/components/sea-saw-page/base";
import DisplayForm from "@/components/sea-saw-design/form/DisplayForm";
import { AttachmentsDisplay } from "@/components/sea-saw-design/attachments";
import OutboundStatusTag from "./OutboundStatusTag";
import OutboundItemsViewToggle from "./items/OutboundItemsViewToggle";
import OutboundOrderInput from "../input/nested/OutboundOrderInput";
import PipelineDisplay from "@/components/sea-saw-page/pipeline/display/PipelineDisplay";
import { pickFormDef, filterFormDefs } from "@/utils/formDefUtils";
import type { PipelineDefs } from "@/components/sea-saw-page/pipeline/display/types";

// Pipeline status colors for Tag
const PIPELINE_STATUS_COLORS: Record<string, string> = {
  draft: "default",
  order_confirmed: "blue",
  in_purchase: "purple",
  purchase_completed: "cyan",
  in_production: "orange",
  production_completed: "lime",
  in_purchase_and_production: "orange",
  purchase_and_production_completed: "lime",
  in_outbound: "geekblue",
  outbound_completed: "purple",
  completed: "success",
  cancelled: "error",
  issue_reported: "warning",
};

const EXCLUDED_FIELDS = ["allowed_actions"] as const;

/** Metadata fields rendered separately via CardMetadata */
const METADATA_FIELDS = [
  "owner",
  "created_at",
  "updated_at",
  "created_by",
  "updated_by",
];

/**
 * OutboundOrderDisplay - Standalone Outbound Order View
 *
 * Displays Outbound Order information with embedded Pipeline access.
 *
 * Features:
 * - Display and edit Outbound Order basic information
 * - Click on related_pipeline to open PipelineDisplay
 */
export default function OutboundOrderDisplay({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  onPipelineCreated,
  def = [],
  data,
  columnOrder,
}: OutboundOrderDisplayProps) {
  const { getViewSet } = useDataService();
  const pipelineViewSet = useMemo(() => getViewSet("pipeline"), [getViewSet]);
  const pipelineMetaLoadedRef = useRef(false);

  const outboundOrder = data ?? {};
  const outboundOrderStatus = outboundOrder.status;
  const hasPipeline = Boolean(outboundOrder.related_pipeline?.id);

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

  const baseDef = useMemo(
    () => def.filter((d) => !EXCLUDED_FIELDS.includes(d.field as any)),
    [def],
  );

  const [editingOutboundOrder, setEditingOutboundOrder] = useState<any>(null);
  const { attachments, ...baseData } = outboundOrder;

  const displayConfig = useMemo(
    () => ({
      // Hide metadata fields - rendered via CardMetadata
      ...Object.fromEntries(METADATA_FIELDS.map((f) => [f, { hidden: true }])),
      status: {
        render: (def: any, value: any) => (
          <OutboundStatusTag def={def} value={value} />
        ),
      },
      related_pipeline: {
        render: (_def: any, value: any) => {
          if (!value?.pipeline_code) {
            return <Text className="text-gray-400">-</Text>;
          }
          const statusColor =
            PIPELINE_STATUS_COLORS[value.status || ""] || "default";
          return (
            <Spin spinning={loadingPipeline} size="small">
              <View
                className="inline-flex flex-row items-center gap-1.5 cursor-pointer group"
                // @ts-ignore - web onClick
                onClick={handleOpenPipeline}
              >
                <Tag
                  color={statusColor}
                  style={{ margin: 0 }}
                  className="transition-all duration-200 group-hover:shadow-md group-hover:scale-105"
                >
                  {value.pipeline_code}
                </Tag>
                <EyeOutlined
                  className="text-gray-400 transition-all duration-200 group-hover:text-blue-500 group-hover:scale-110"
                  style={{ fontSize: 14 }}
                />
              </View>
            </Spin>
          );
        },
      },
      outbound_items: {
        fullWidth: true,
        render: (def: any, value: any) => (
          <OutboundItemsViewToggle def={def} value={value} />
        ),
      },
      attachments: {
        fullWidth: true,
        render: (def: any, value: any) => (
          <AttachmentsDisplay def={def} value={value} />
        ),
      },
    }),
    [loadingPipeline, handleOpenPipeline],
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
        <SectionContainer title={i18n.t("Outbound Order Information")}>
          <DisplayForm
            table="outbound_order"
            def={baseDef}
            data={{ ...baseData, attachments }}
            config={displayConfig}
            columnOrder={columnOrder}
          />
          {/* System metadata + Edit button */}
          <CardSection className="py-2.5 bg-slate-50/50 mt-2">
            <View className="flex-row justify-between items-center">
              <CardMetadata
                owner={outboundOrder.owner}
                created_at={outboundOrder.created_at}
                updated_at={outboundOrder.updated_at}
                created_by={outboundOrder.created_by}
                updated_by={outboundOrder.updated_by}
              />
              {outboundOrderStatus === "draft" && (
                <CardEditButton
                  onClick={() => setEditingOutboundOrder(outboundOrder)}
                />
              )}
            </View>
          </CardSection>
          <OutboundOrderInput
            isOpen={!!editingOutboundOrder}
            def={baseDef}
            data={editingOutboundOrder ?? {}}
            onClose={() => setEditingOutboundOrder(null)}
            onCreate={onCreate}
            onUpdate={onUpdate}
          />
        </SectionContainer>

        {hasPipeline && outboundOrder.related_pipeline?.pipeline_code && (
          <View className="p-4 bg-blue-50 rounded-lg flex-row items-start gap-2">
            <InfoCircleOutlined style={{ color: "#1e40af", marginTop: 2 }} />
            <Text className="text-blue-800 text-sm flex-1">
              {i18n.t(
                "This outbound order is associated with pipeline: {{code}}",
                { code: outboundOrder.related_pipeline.pipeline_code },
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
    </Drawer>
  );
}
