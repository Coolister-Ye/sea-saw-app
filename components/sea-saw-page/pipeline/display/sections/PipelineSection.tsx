import React from "react";
import i18n from "@/locale/i18n";
import { PipelineInput } from "../../input/standalone/PipelineInput";
import { PipelineSectionProps } from "../types";
import {
  QueueListIcon,
  DocumentTextIcon,
} from "react-native-heroicons/outline";
import PipelineCard from "../items/PipelineCard";
import {
  SectionWrapper,
  SectionHeader,
  SectionStatsBadge,
  SectionContentCard,
} from "@/components/sea-saw-page/base";

export default function PipelineSection({
  pipeline,
  defs,
  editingPipeline,
  setEditingPipeline,
  onCreate,
  onUpdate,
}: PipelineSectionProps) {
  // Calculate summary statistics
  const hasAttachments =
    pipeline.attachments && pipeline.attachments.length > 0;
  const attachmentCount = pipeline.attachments?.length || 0;

  // Generate subtitle text
  const subtitle = pipeline.id ? `ID: ${pipeline.id}` : undefined;

  // Generate stats badge
  const statsBadge = hasAttachments ? (
    <SectionStatsBadge
      icon={<DocumentTextIcon size={14} color="#64748b" />}
      label={`${attachmentCount} ${i18n.t("attachments")}`}
    />
  ) : undefined;

  return (
    <SectionWrapper>
      <SectionHeader
        icon={<QueueListIcon size={20} color="#ffffff" />}
        iconGradient="from-purple-500 to-purple-600"
        iconShadow="shadow-purple-500/25"
        title={i18n.t("Pipeline Information")}
        subtitle={subtitle}
        rightContent={statsBadge}
      />

      <SectionContentCard gradientColors="from-purple-400 via-purple-500 to-indigo-400">
        <PipelineCard
          def={defs.base}
          value={pipeline}
          onItemClick={() => setEditingPipeline(pipeline)}
          canEdit={false}
        />
      </SectionContentCard>

      <PipelineInput
        isOpen={Boolean(editingPipeline)}
        def={defs.base}
        data={editingPipeline ?? {}}
        onClose={() => setEditingPipeline(null)}
        onCreate={onCreate}
        onUpdate={onUpdate}
      />
    </SectionWrapper>
  );
}
