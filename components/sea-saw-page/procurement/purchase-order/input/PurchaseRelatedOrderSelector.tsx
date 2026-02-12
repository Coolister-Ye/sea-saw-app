import React, { useState, useEffect, useMemo } from "react";
import { Select, Spin } from "antd";
import { FormDef } from "@/hooks/useFormDefs";
import useDataService from "@/hooks/useDataService";

interface PurchaseRelatedOrderSelectorProps {
  def: FormDef;
  value?: number;
  onChange?: (value: number) => void;
}

export default function PurchaseRelatedOrderSelector({
  def,
  value,
  onChange,
}: PurchaseRelatedOrderSelectorProps) {
  const { getViewSet } = useDataService();
  const order = useMemo(() => getViewSet("order"), [getViewSet]);

  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await order.list();
        setOrders(res?.results || res || []);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [order]);

  const options = orders.map((o) => ({
    label: o.order_code || `Order #${o.id}`,
    value: o.id,
  }));

  return (
    <Select
      value={value}
      onChange={onChange}
      options={options}
      placeholder={def.help_text || "Select Related Order"}
      style={{ width: "100%" }}
      showSearch
      filterOption={(input, option) =>
        (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
      }
      notFoundContent={loading ? <Spin size="small" /> : "No orders found"}
      loading={loading}
    />
  );
}
