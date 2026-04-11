import { useState, useCallback, useEffect, useMemo } from "react";
import useDataService from "@/hooks/useDataService";
import { devError } from "@/utils/logger";

export interface FilterPreset {
  id: number;
  entity: string;
  name: string;
  /** Stable slug key (e.g. "all", "pending") — mainly used for system presets */
  key?: string;
  params: Record<string, any>;
  preset_type: "system" | "user";
  created_at: string;
  updated_at: string;
}

export default function useFilterPresets(entity: string) {
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [loading, setLoading] = useState(false);
  const { getViewSet } = useDataService();

  const viewSet = useMemo(() => getViewSet("filterPresets"), [getViewSet]);

  const fetchPresets = useCallback(async () => {
    setLoading(true);
    try {
      const data = await viewSet.list({ params: { entity } });
      setPresets(data?.results ?? data ?? []);
    } catch (err) {
      devError("Failed to fetch filter presets:", err);
    } finally {
      setLoading(false);
    }
  }, [entity, viewSet]);

  const createPreset = useCallback(
    async (name: string, params: Record<string, any>) => {
      await viewSet.create({ body: { entity, name, params, preset_type: "user" } });
      await fetchPresets();
    },
    [entity, viewSet, fetchPresets],
  );

  const deletePreset = useCallback(
    async (id: number) => {
      await viewSet.delete({ id });
      setPresets((prev) => prev.filter((p) => p.id !== id));
    },
    [viewSet],
  );

  const updatePreset = useCallback(
    async (id: number, data: { name?: string; params?: Record<string, any> }) => {
      await viewSet.update({ id, body: data });
      await fetchPresets();
    },
    [viewSet, fetchPresets],
  );

  const systemPresets = useMemo(
    () => presets.filter((p) => p.preset_type === "system"),
    [presets],
  );

  const userPresets = useMemo(
    () => presets.filter((p) => p.preset_type === "user"),
    [presets],
  );

  useEffect(() => {
    fetchPresets();
  }, [fetchPresets]);

  return {
    presets,
    systemPresets,
    userPresets,
    loading,
    createPreset,
    deletePreset,
    updatePreset,
  };
}
