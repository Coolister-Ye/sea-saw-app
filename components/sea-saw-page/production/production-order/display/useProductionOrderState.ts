import { useEffect, useState, useCallback } from "react";
import useDataService from "@/hooks/useDataService";

export function useProductionOrderState(
  productionOrderId: number | string | undefined,
) {
  const { request } = useDataService();
  const [optionState, setOptionState] = useState<string[]>([]);
  const [isLoadingState, setIsLoadingState] = useState(false);

  const fetchProductionOrderState = useCallback(() => {
    if (!productionOrderId) return;

    setIsLoadingState(true);
    request({
      uri: "updateProductionOrders",
      method: "OPTIONS",
      id: productionOrderId,
    })
      .then((data) => {
        setOptionState(data?.state_actions ?? []);
      })
      .catch(() => setOptionState([]))
      .finally(() => setIsLoadingState(false));
  }, [productionOrderId, request]);

  useEffect(() => {
    fetchProductionOrderState();
  }, [fetchProductionOrderState]);

  return {
    optionState,
    isLoadingState,
    refreshProductionOrderState: fetchProductionOrderState,
  };
}
