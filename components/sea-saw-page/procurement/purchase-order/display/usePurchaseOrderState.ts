import { useEffect, useState, useCallback } from "react";
import useDataService from "@/hooks/useDataService";

export function usePurchaseOrderState(
  purchaseOrderId: number | string | undefined,
) {
  const { request } = useDataService();
  const [optionState, setOptionState] = useState<string[]>([]);
  const [isLoadingState, setIsLoadingState] = useState(false);

  const fetchPurchaseOrderState = useCallback(() => {
    if (!purchaseOrderId) return;

    setIsLoadingState(true);
    request({
      uri: "updatePurchaseOrders",
      method: "OPTIONS",
      id: purchaseOrderId,
    })
      .then((data) => {
        setOptionState(data?.state_actions ?? []);
      })
      .catch(() => setOptionState([]))
      .finally(() => setIsLoadingState(false));
  }, [purchaseOrderId, request]);

  useEffect(() => {
    fetchPurchaseOrderState();
  }, [fetchPurchaseOrderState]);

  return {
    optionState,
    isLoadingState,
    refreshPurchaseOrderState: fetchPurchaseOrderState,
  };
}
