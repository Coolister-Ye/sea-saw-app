import { useCallback, useMemo, useState } from "react";
import useDataService from "@/hooks/useDataService";
import type { PipelineTimestamps } from "@/components/sea-saw-page/pipeline/display/renderers/PipelineTimeline";

const TIMESTAMP_FIELDS = [
  "created_at",
  "confirmed_at",
  "in_purchase_at",
  "purchase_completed_at",
  "in_production_at",
  "production_completed_at",
  "in_purchase_and_production_at",
  "purchase_and_production_completed_at",
  "in_outbound_at",
  "outbound_completed_at",
  "completed_at",
  "cancelled_at",
] as const;

function extractTimestamps(data: Record<string, unknown>): PipelineTimestamps {
  return Object.fromEntries(
    TIMESTAMP_FIELDS.map((f) => [f, (data?.[f] as string) ?? null])
  ) as PipelineTimestamps;
}

/**
 * Lazy-fetches pipeline timestamps on first hover-open.
 * Call `fetchOnOpen(visible)` from Ant Design Popover's `onOpenChange`.
 */
export function usePipelineTimestamps(pipelineId: number | null) {
  const { getViewSet } = useDataService();
  const pipelineViewSet = useMemo(() => getViewSet("pipeline"), [getViewSet]);

  const [loading, setLoading] = useState(false);
  const [timestamps, setTimestamps] = useState<PipelineTimestamps | undefined>(undefined);

  const fetchOnOpen = useCallback(
    async (visible: boolean) => {
      if (!visible || !pipelineId || timestamps !== undefined) return;
      setLoading(true);
      try {
        const data = await pipelineViewSet.retrieve({ id: pipelineId });
        setTimestamps(extractTimestamps(data ?? {}));
      } catch {
        setTimestamps({});
      } finally {
        setLoading(false);
      }
    },
    [pipelineId, pipelineViewSet, timestamps]
  );

  return { timestamps, loading, fetchOnOpen };
}
