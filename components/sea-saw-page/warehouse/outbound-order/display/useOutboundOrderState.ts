import { useEffect, useState, useCallback } from "react";
import useDataService from "@/hooks/useDataService";

export function useOutboundOrderState(
  outboundOrderId: number | string | undefined,
) {
  const { request } = useDataService();
  const [optionState, setOptionState] = useState<string[]>([]);
  const [isLoadingState, setIsLoadingState] = useState(false);

  const fetchOutboundOrderState = useCallback(() => {
    if (!outboundOrderId) return;

    setIsLoadingState(true);
    request({
      uri: "updateOutboundOrders",
      method: "OPTIONS",
      id: outboundOrderId,
    })
      .then((data) => {
        setOptionState(data?.state_actions ?? []);
      })
      .catch(() => setOptionState([]))
      .finally(() => setIsLoadingState(false));
  }, [outboundOrderId, request]);

  useEffect(() => {
    fetchOutboundOrderState();
  }, [fetchOutboundOrderState]);

  return {
    optionState,
    isLoadingState,
    refreshOutboundOrderState: fetchOutboundOrderState,
  };
}
