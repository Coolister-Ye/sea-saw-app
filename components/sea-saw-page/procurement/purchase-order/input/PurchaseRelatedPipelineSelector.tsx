import React, { useState, useRef, useMemo, useCallback } from "react";
import { Select, Spin } from "antd";
import { FormDef } from "@/hooks/useFormDefs";
import useDataService from "@/hooks/useDataService";

interface PurchaseRelatedPipelineSelectorProps {
  def: FormDef;
  value?: number | { id?: number; pk?: number; [key: string]: any };
  onChange?: (value: number | null) => void;
  /** Called with the full pipeline object on selection — use to auto-fill related order */
  onPipelineSelect?: (pipeline: any | null) => void;
}

export default function PurchaseRelatedPipelineSelector({
  def,
  value,
  onChange,
  onPipelineSelect,
}: PurchaseRelatedPipelineSelectorProps) {
  const resolvedValue =
    typeof value === "object" && value !== null
      ? (value?.id ?? value?.pk)
      : value;

  const { getViewSet } = useDataService();
  const pipelineViewSet = useMemo(() => getViewSet("pipeline"), [getViewSet]);

  const [loading, setLoading] = useState(false);
  const [pipelines, setPipelines] = useState<any[]>([]);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchPipelines = useCallback(
    async (search: string) => {
      try {
        setLoading(true);
        const params = search ? { search } : {};
        const res = await pipelineViewSet.list({ params });
        setPipelines(res?.results || res || []);
      } catch {
        setPipelines([]);
      } finally {
        setLoading(false);
      }
    },
    [pipelineViewSet],
  );

  const handleSearch = useCallback(
    (input: string) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => fetchPipelines(input), 400);
    },
    [fetchPipelines],
  );

  const handleFocus = useCallback(() => {
    if (pipelines.length === 0) fetchPipelines("");
  }, [pipelines.length, fetchPipelines]);

  const handleChange = useCallback(
    (id: number | null) => {
      onChange?.(id);
      if (onPipelineSelect) {
        const pipeline = id != null ? pipelines.find((p) => p.id === id) : null;
        onPipelineSelect(pipeline ?? null);
      }
    },
    [onChange, onPipelineSelect, pipelines],
  );

  // Ensure the currently-selected item always appears in options (e.g. when auto-filled)
  const currentOption = useMemo(() => {
    if (typeof value === "object" && value !== null) {
      const id = value?.id ?? value?.pk;
      const label = value?.pipeline_code;
      if (id && label) return { value: id, label };
    }
    return null;
  }, [value]);

  const options = useMemo(() => {
    const base = pipelines.map((p) => ({
      label: p.pipeline_code || `Pipeline #${p.id}`,
      value: p.id,
    }));
    if (currentOption && !base.some((p) => p.value === currentOption.value)) {
      return [currentOption, ...base];
    }
    return base;
  }, [pipelines, currentOption]);

  return (
    <Select
      value={resolvedValue ?? null}
      onChange={handleChange}
      options={options}
      placeholder={def.help_text || "Select Related Pipeline"}
      style={{ width: "100%" }}
      showSearch
      filterOption={false}
      onSearch={handleSearch}
      onFocus={handleFocus}
      notFoundContent={loading ? <Spin size="small" /> : "No pipelines found"}
      loading={loading}
      allowClear
    />
  );
}
