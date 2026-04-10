import { View } from "react-native";
import { Text } from "@/components/sea-saw-design/text";
import {
  PipelineTimeline,
  type PipelineTimestamps,
} from "@/components/sea-saw-page/pipeline/display/renderers/PipelineTimeline";

export const POPOVER_WIDTH = 220;

export function PopoverDivider() {
  return <View className="h-px bg-slate-200 dark:bg-slate-700 mb-2.5" />;
}

type Props = {
  accountName: string;
  badge: React.ReactNode;
  subtitle: string;
  etd: string;
  eta: string | null;
  /** className applied to the ETA value text. Defaults to conditional primary/muted. */
  etaClassName?: string;
  /** Optional warning message shown above PipelineTimeline. */
  warning?: string;
  pipelineCode: string | null;
  pipelineStatus: string | null;
  timestamps?: PipelineTimestamps;
  loading: boolean;
};

export function OrderPopoverContent({
  accountName,
  badge,
  subtitle,
  etd,
  eta,
  etaClassName,
  warning,
  pipelineCode,
  pipelineStatus,
  timestamps,
  loading,
}: Props) {
  return (
    <View style={{ width: POPOVER_WIDTH, paddingVertical: 4 }}>
      {/* Row 1: account name + badge */}
      <View className="flex-row items-center justify-between mb-0.5">
        <Text size="sm" weight="semibold" ellipsis style={{ flex: 1, marginRight: 6 }}>
          {accountName}
        </Text>
        {badge}
      </View>

      {/* Row 2: subtitle (amount / outbound code) */}
      <Text size="xs" variant="secondary" className="mb-3">
        {subtitle}
      </Text>

      {/* Row 3: ETD → ETA date range */}
      <View className="mb-2.5">
        <View className="flex-row mb-0.5">
          <Text size="xs" variant="tertiary" style={{ flex: 1 }}>ETD</Text>
          <View style={{ width: 24 }} />
          <Text size="xs" variant="tertiary" align="right" style={{ flex: 1 }}>ETA</Text>
        </View>
        <View className="flex-row items-center">
          <Text size="xs" weight="medium" style={{ flex: 1 }}>{etd}</Text>
          <Text size="xs" variant="tertiary" align="center" style={{ width: 24 }}>→</Text>
          <Text
            size="xs"
            weight="medium"
            align="right"
            style={{ flex: 1 }}
            className={etaClassName ?? (eta ? "text-primary" : "text-foreground/20")}
          >
            {eta ?? "—"}
          </Text>
        </View>
      </View>

      <PopoverDivider />

      {warning && (
        <Text size="xs" className="text-red-500 mb-2">⚠ {warning}</Text>
      )}

      <PipelineTimeline
        pipelineCode={pipelineCode}
        pipelineStatus={pipelineStatus}
        timestamps={timestamps}
        loading={loading}
      />
    </View>
  );
}
