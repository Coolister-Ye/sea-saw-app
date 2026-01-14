import React, { useMemo } from "react";
import { useLocale } from "@/context/Locale";
import Section from "../../../base/Section";
import DisplayForm from "@/components/sea-saw-design/form/DisplayForm";
import { PipelineInput } from "../../../input/pipeline";
import { PipelineSectionProps } from "../types";
import ContactPopover from "../../contact/ContactPopover";
import AttachmentsDisplay from "../../shared/AttachmentsDisplay";
import PipelineStatusTag from "../renderers/PipelineStatusTag";

export default function PipelineSection({
  pipeline,
  defs,
  displayConfig,
  editingPipeline,
  setEditingPipeline,
  onCreate,
  onUpdate,
}: PipelineSectionProps) {
  const { i18n } = useLocale();

  const {
    orders,
    production_orders,
    purchase_orders,
    outbound_orders,
    payments,
    attachments,
    allowed_actions,
    ...baseData
  } = pipeline;

  const _displayConfig = useMemo(
    () => ({
      status: {
        render: (f: any, v: any) => <PipelineStatusTag def={f} value={v} />,
      },
      contact: {
        render: (f: any, v: any) => <ContactPopover def={f} value={v} />,
      },
      attachments: {
        fullWidth: true,
        render: (f: any, v: any[]) => <AttachmentsDisplay def={f} value={v} />,
      },
      ...displayConfig,
    }),
    [displayConfig]
  );

  return (
    <Section title={i18n.t("Pipeline Information")}>
      <DisplayForm
        table="pipeline"
        def={defs.base}
        data={{ ...baseData, attachments }}
        config={_displayConfig}
        onEdit={() => setEditingPipeline(pipeline)}
      />
      <PipelineInput
        isOpen={Boolean(editingPipeline)}
        def={defs.base}
        data={editingPipeline ?? {}}
        onClose={() => setEditingPipeline(null)}
        onCreate={onCreate}
        onUpdate={onUpdate}
      />
    </Section>
  );
}
