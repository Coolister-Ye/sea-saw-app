import React from "react";
import i18n from '@/locale/i18n';
import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { PipelineInput } from "../../../../input/pipeline";
import { PipelineSectionProps } from "../../types";
import {
  QueueListIcon,
  DocumentTextIcon,
} from "react-native-heroicons/outline";
import PipelineCard from "../../items/PipelineCard";

export default function PipelineSection({
  pipeline,
  defs,
  editingPipeline,
  setEditingPipeline,
  onCreate,
  onUpdate,
}: PipelineSectionProps) {
  // Calculate summary statistics
  const hasAttachments = pipeline.attachments && pipeline.attachments.length > 0;
  const attachmentCount = pipeline.attachments?.length || 0;

  return (
    <View className="mb-8">
      {/* Section Header with Stats */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 items-center justify-center shadow-lg shadow-purple-500/25">
            <QueueListIcon size={20} color="#ffffff" />
          </View>
          <View>
            <Text
              className="text-lg font-semibold text-slate-800 tracking-tight"
              style={{ fontFamily: "System" }}
            >
              {i18n.t("Pipeline Information")}
            </Text>
            {pipeline.id && (
              <Text className="text-xs text-slate-400 mt-0.5">
                ID: {pipeline.id}
              </Text>
            )}
          </View>
        </View>

        {/* Summary Stats Badge */}
        {hasAttachments && (
          <View className="flex-row items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100">
            <DocumentTextIcon size={14} color="#64748b" />
            <Text className="text-sm font-semibold text-slate-600 font-mono tracking-tight">
              {attachmentCount} {i18n.t("attachments")}
            </Text>
          </View>
        )}
      </View>

      {/* Content Card */}
      <View
        className="rounded-2xl overflow-hidden border border-slate-200/60 bg-white"
        style={{
          shadowColor: "#0f172a",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.03,
          shadowRadius: 12,
        }}
      >
        {/* Decorative top gradient line */}
        <View className="h-1 bg-gradient-to-r from-purple-400 via-purple-500 to-indigo-400" />

        <View className="p-1">
          <PipelineCard
            def={defs.base}
            value={pipeline}
            onItemClick={() => setEditingPipeline(pipeline)}
            canEdit={false}
          />
        </View>
      </View>

      <PipelineInput
        isOpen={Boolean(editingPipeline)}
        def={defs.base}
        data={editingPipeline ?? {}}
        onClose={() => setEditingPipeline(null)}
        onCreate={onCreate}
        onUpdate={onUpdate}
      />
    </View>
  );
}
