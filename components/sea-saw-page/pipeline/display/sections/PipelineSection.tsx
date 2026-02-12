import React from "react";
import i18n from "@/locale/i18n";
import { PipelineInput } from "../../input/standalone/PipelineInput";
import { PipelineSectionProps } from "../types";
import { QueueListIcon } from "react-native-heroicons/outline";
import PipelineCard from "../PipelineCard";
import {
  SectionWrapper,
  SectionHeader,
  SectionContentCard,
} from "@/components/sea-saw-page/base";

export default function PipelineSection({
  pipeline,
  def,
  editingPipeline,
  setEditingPipeline,
  onCreate,
  onUpdate,
}: PipelineSectionProps) {
  return (
    <SectionWrapper>
      <SectionHeader
        icon={<QueueListIcon size={20} color="#ffffff" />}
        iconGradient="from-purple-500 to-purple-600"
        iconShadow="shadow-purple-500/25"
        title={i18n.t("Pipeline Information")}
        subtitle={pipeline.id ? `ID: ${pipeline.id}` : undefined}
      />

      <SectionContentCard gradientColors="from-purple-400 via-purple-500 to-indigo-400">
        <PipelineCard
          def={def}
          value={pipeline}
          onItemClick={() => setEditingPipeline(pipeline)}
          canEdit={false}
        />
      </SectionContentCard>

      <PipelineInput
        isOpen={Boolean(editingPipeline)}
        def={def}
        data={editingPipeline ?? {}}
        onClose={() => setEditingPipeline(null)}
        onCreate={onCreate}
        onUpdate={onUpdate}
      />
    </SectionWrapper>
  );
}
