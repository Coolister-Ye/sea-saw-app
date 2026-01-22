import React, { useMemo } from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { useLocale } from "@/context/Locale";
import DisplayForm from "@/components/sea-saw-design/form/DisplayForm";
import { PipelineInput } from "../../../../input/pipeline";
import { PipelineSectionProps } from "../../types";
import ContactPopover from "../../../contact/ContactPopover";
import { AttachmentsDisplay } from "@/components/sea-saw-design/attachments";
import PipelineStatusTag from "../../renderers/PipelineStatusTag";
import { QueueListIcon, DocumentTextIcon } from "react-native-heroicons/outline";

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
    order,
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
    [displayConfig],
  );

  // Calculate summary statistics
  const hasAttachments = attachments && attachments.length > 0;
  const attachmentCount = attachments?.length || 0;

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
          <DisplayForm
            table="pipeline"
            def={defs.base}
            data={{ ...baseData, attachments }}
            config={_displayConfig}
            // onEdit={() => setEditingPipeline(pipeline)}
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
