import { useEffect, useState, useCallback } from "react";
import useDataService from "@/hooks/useDataService";

export function useOrderState(orderId: number | string | undefined) {
  const { request } = useDataService();
  const [optionState, setOptionState] = useState<string[]>([]);
  const [isLoadingState, setIsLoadingState] = useState(false);

  const fetchOrderState = useCallback(() => {
    if (!orderId) return;

    setIsLoadingState(true);
    request({
      uri: "updateOrders",
      method: "OPTIONS",
      id: orderId,
    })
      .then((data) => {
        setOptionState(data?.state_actions ?? []);
      })
      .catch(() => setOptionState([]))
      .finally(() => setIsLoadingState(false));
  }, [orderId, request]);

  useEffect(() => {
    fetchOrderState();
  }, [fetchOrderState]);

  return { optionState, isLoadingState, refreshOrderState: fetchOrderState };
}
