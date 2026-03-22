import { useState, useCallback } from "react";

export interface UseViewDrawerReturn {
  isViewOpen: boolean;
  viewRow: any;
  /** 暴露 setViewRow 供 useEntityPage 在 closeEdit / success handlers 中同步数据 */
  setViewRow: React.Dispatch<React.SetStateAction<any>>;
  openView: (row: any) => void;
  closeView: () => void;
}

export function useViewDrawer(): UseViewDrawerReturn {
  const [isViewOpen, setViewOpen] = useState(false);
  const [viewRow, setViewRow] = useState<any>(null);

  const openView = useCallback((row: any) => {
    setViewRow(row);
    setViewOpen(true);
  }, []);

  const closeView = useCallback(() => {
    setViewOpen(false);
    setViewRow(null);
  }, []);

  return { isViewOpen, viewRow, setViewRow, openView, closeView };
}
