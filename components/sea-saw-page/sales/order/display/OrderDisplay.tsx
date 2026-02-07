import React, { useMemo, useState, useCallback, useRef } from "react";
import i18n from "@/locale/i18n";
import { View, ScrollView, Text } from "react-native";
import { Button, message, Tag, Spin } from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

import useDataService from "@/hooks/useDataService";
import { devError } from "@/utils/logger";
import { OrderDisplayProps } from "./types";
import {
  Drawer,
  SectionContainer,
  CardMetadata,
  CardSection,
  CardEditButton,
} from "@/components/sea-saw-page/base";
import DisplayForm from "@/components/sea-saw-design/form/DisplayForm";
import { AttachmentsDisplay } from "@/components/sea-saw-design/attachments";
import OrderStatusTag from "./OrderStatusTag";
import AccountPopover from "@/components/sea-saw-page/crm/account/display/AccountPopover";
import { ContactPopover } from "@/components/sea-saw-page/crm/contact/display";
import ProductItemsViewToggle from "./items/ProductItemsViewToggle";
import OrderInput from "../input/OrderInput";
import PipelineDisplay from "@/components/sea-saw-page/pipeline/display/PipelineDisplay";
import PipelineTypeModal from "../input/PipelineTypeModal";

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
 * OrderDisplay - Standalone Order View
 *
 * Displays Order information with embedded Pipeline access.
 *
 * Features:
 * - Display and edit Order basic information
 * - Create Pipeline button for orders without pipeline
 * - Click on related_pipeline to open PipelineDisplay
 */
export default function OrderDisplay({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  onPipelineCreated,
  def = [],
  data,
  columnOrder,
}: OrderDisplayProps) {
  const { request, getViewSet } = useDataService();
  const pipelineViewSet = useMemo(() => getViewSet("pipeline"), [getViewSet]);
  const pipelineMetaLoadedRef = useRef(false);

  const order = data ?? {};
  const orderStatus = order.status;
  const hasPipeline = Boolean(order.related_pipeline?.id);

  const [creatingPipeline, setCreatingPipeline] = useState(false);
  const [pipelineTypeModalOpen, setPipelineTypeModalOpen] = useState(false);

  // Pipeline display state
  const [isPipelineOpen, setIsPipelineOpen] = useState(false);
  const [pipelineData, setPipelineData] = useState<any>(null);
  const [pipelineMeta, setPipelineMeta] = useState<any>({});
  const [loadingPipeline, setLoadingPipeline] = useState(false);

  const pipelineFormDefs = useMemo(
    () =>
      Object.entries(pipelineMeta).map(([field, meta]: [string, any]) => ({
        field,
        ...meta,
      })),
    [pipelineMeta],
  );

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
    if (updated) setPipelineData(updated);
  }, []);

  const baseDef = useMemo(
    () => def.filter((d) => !EXCLUDED_FIELDS.includes(d.field as any)),
    [def],
  );

  const [editingOrder, setEditingOrder] = useState<any>(null);
  const { attachments, ...baseData } = order;

  const displayConfig = useMemo(
    () => ({
      account_id: { hidden: true },
      contact_id: { hidden: true },
      // Hide metadata fields - rendered via CardMetadata
      ...Object.fromEntries(METADATA_FIELDS.map((f) => [f, { hidden: true }])),
      status: {
        render: (def: any, value: any) => <OrderStatusTag value={value} />,
      },
      account: {
        render: (def: any, value: any) => (
          <AccountPopover def={def} value={value} />
        ),
      },
      contact: {
        render: (def: any, value: any) => (
          <ContactPopover def={def} value={value} />
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
      order_items: {
        fullWidth: true,
        render: (def: any, value: any) => (
          <ProductItemsViewToggle def={def} value={value} />
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
        <SectionContainer title={i18n.t("Order Information")}>
          <DisplayForm
            table="order"
            def={baseDef}
            data={{ ...baseData, attachments }}
            config={displayConfig}
            columnOrder={columnOrder}
          />
          {/* System metadata + Edit button */}
          <CardSection className="py-2.5 bg-slate-50/50 mt-2">
            <View className="flex-row justify-between items-center">
              <CardMetadata
                owner={order.owner}
                created_at={order.created_at}
                updated_at={order.updated_at}
                created_by={order.created_by}
                updated_by={order.updated_by}
              />
              {orderStatus === "draft" && (
                <CardEditButton onClick={() => setEditingOrder(order)} />
              )}
            </View>
          </CardSection>
          <OrderInput
            isOpen={!!editingOrder}
            def={baseDef}
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
          def={pipelineFormDefs}
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
