import { useState, useCallback, useEffect, useMemo } from "react";
import useDataService from "@/hooks/useDataService";
import { devError } from "@/utils/logger";

export interface CustomView {
  id: number;
  entity: string;
  name: string;
  /** Stable slug key for system views (e.g. "all", "pending") */
  key: string;
  is_system: boolean;
  params: Record<string, any>;
  /** Ordered list of visible column field names. Empty array = use page default. */
  column_order: string[];
  visibility: "private" | "shared" | "public";
  is_default: boolean;
  /** PKs of users this view is shared with */
  shared_users: number[];
  /** PKs of roles this view is shared with */
  shared_roles: number[];
  shared_user_names: string[];
  shared_role_names: string[];
  owner_username: string;
  /** Whether the current user owns this view (false for system views) */
  is_owner: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomViewPayload {
  name: string;
  entity: string;
  params?: Record<string, any>;
  column_order?: string[];
  visibility?: "private" | "shared" | "public";
  is_default?: boolean;
  shared_users?: number[];
  shared_roles?: number[];
}

export type UpdateCustomViewPayload = Partial<CreateCustomViewPayload>;

export default function useCustomViews(entity: string) {
  const [views, setViews] = useState<CustomView[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeViewId, setActiveViewId] = useState<number | null>(null);
  const { getViewSet } = useDataService();

  const viewSet = useMemo(() => getViewSet("customViews"), [getViewSet]);

  const fetchViews = useCallback(async () => {
    if (!entity) return;
    setLoading(true);
    try {
      const data = await viewSet.list({ params: { entity } });
      const fetched: CustomView[] = data?.results ?? data ?? [];
      setViews(fetched);
      // Auto-activate on first load: prefer user default → fallback to system "all"
      setActiveViewId((prev) => {
        if (prev !== null) return prev;
        const userDefault = fetched.find((v) => !v.is_system && v.is_default);
        if (userDefault) return userDefault.id;
        const allView = fetched.find((v) => v.is_system && v.key === "all");
        return allView?.id ?? fetched.find((v) => v.is_system)?.id ?? null;
      });
    } catch (err) {
      devError("Failed to fetch custom views:", err);
    } finally {
      setLoading(false);
    }
  }, [entity, viewSet]);

  const createView = useCallback(
    async (payload: CreateCustomViewPayload): Promise<CustomView> => {
      const created = await viewSet.create({ body: { entity, ...payload } });
      await fetchViews();
      return created;
    },
    [entity, viewSet, fetchViews],
  );

  const updateView = useCallback(
    async (id: number, payload: UpdateCustomViewPayload): Promise<CustomView> => {
      const updated = await viewSet.update({ id, body: payload });
      await fetchViews();
      return updated;
    },
    [viewSet, fetchViews],
  );

  const deleteView = useCallback(
    async (id: number): Promise<void> => {
      await viewSet.delete({ id });
      setViews((prev) => prev.filter((v) => v.id !== id));
      setActiveViewId((prev) => (prev === id ? null : prev));
    },
    [viewSet],
  );

  const setDefaultView = useCallback(
    async (id: number): Promise<void> => {
      await updateView(id, { is_default: true });
    },
    [updateView],
  );

  const systemViews = useMemo(() => views.filter((v) => v.is_system), [views]);
  const userViews = useMemo(() => views.filter((v) => !v.is_system), [views]);
  const activeView = useMemo(
    () => views.find((v) => v.id === activeViewId) ?? null,
    [views, activeViewId],
  );

  useEffect(() => {
    fetchViews();
  }, [fetchViews]);

  return {
    views,
    systemViews,
    userViews,
    loading,
    activeViewId,
    activeView,
    setActiveViewId,
    createView,
    updateView,
    deleteView,
    setDefaultView,
    refresh: fetchViews,
  };
}
