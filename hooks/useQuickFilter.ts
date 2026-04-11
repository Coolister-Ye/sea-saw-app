import { useState, useCallback } from "react";

export default function useQuickFilter(defaultKey = "all") {
  const [activeKey, setActiveKey] = useState(defaultKey);
  const resetToAll = useCallback(() => setActiveKey("all"), []);
  return { activeKey, setActiveKey, resetToAll };
}
