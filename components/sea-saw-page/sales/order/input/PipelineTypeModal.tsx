import React, { useState, useCallback } from "react";
import { View, Text } from "react-native";
import { Modal, Radio, Space } from "antd";
import type { RadioChangeEvent } from "antd";
import i18n from "@/locale/i18n";

// Pipeline type options with descriptions
const PIPELINE_TYPES = [
  {
    value: "production_flow",
    labelKey: "production_flow",
    descriptionKey: "Production Flow Description",
  },
  {
    value: "purchase_flow",
    labelKey: "purchase_flow",
    descriptionKey: "Purchase Flow Description",
  },
  {
    value: "hybrid_flow",
    labelKey: "hybrid_flow",
    descriptionKey: "Hybrid Flow Description",
  },
] as const;

interface PipelineTypeModalProps {
  open: boolean;
  loading?: boolean;
  onConfirm: (pipelineType: string) => void;
  onCancel: () => void;
}

export default function PipelineTypeModal({
  open,
  loading = false,
  onConfirm,
  onCancel,
}: PipelineTypeModalProps) {
  const [selectedType, setSelectedType] = useState<string>("production_flow");

  const handleConfirm = useCallback(() => {
    onConfirm(selectedType);
  }, [selectedType, onConfirm]);

  const handleCancel = useCallback(() => {
    setSelectedType("production_flow");
    onCancel();
  }, [onCancel]);

  return (
    <Modal
      title={i18n.t("Select Pipeline Type")}
      open={open}
      onOk={handleConfirm}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText={i18n.t("Create Pipeline")}
      cancelText={i18n.t("Cancel")}
    >
      <Radio.Group
        value={selectedType}
        onChange={(e: RadioChangeEvent) => setSelectedType(e.target.value)}
        style={{ width: "100%" }}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          {PIPELINE_TYPES.map((type) => (
            <Radio key={type.value} value={type.value} style={{ padding: "8px 0" }}>
              <View>
                <Text style={{ fontWeight: "500" }}>
                  {i18n.t(type.labelKey)}
                </Text>
                <Text style={{ color: "#666", fontSize: 12 }}>
                  {i18n.t(type.descriptionKey)}
                </Text>
              </View>
            </Radio>
          ))}
        </Space>
      </Radio.Group>
    </Modal>
  );
}
