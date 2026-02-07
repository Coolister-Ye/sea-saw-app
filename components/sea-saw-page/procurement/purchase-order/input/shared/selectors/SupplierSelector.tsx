import React, { useState, useEffect, useMemo } from "react";
import { Select, Spin } from "antd";
import { FormDef } from "@/hooks/useFormDefs";
import useDataService from "@/hooks/useDataService";

interface SupplierSelectorProps {
  def: FormDef;
  value?: number;
  onChange?: (value: number) => void;
}

export default function SupplierSelector({
  def,
  value,
  onChange,
}: SupplierSelectorProps) {
  const { getViewSet } = useDataService();
  const supplier = useMemo(() => getViewSet("supplier"), [getViewSet]);

  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setLoading(true);
        const res = await supplier.list();
        setSuppliers(res?.results || res || []);
      } catch (error) {
        console.error("Failed to fetch suppliers:", error);
        setSuppliers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, [supplier]);

  const options = suppliers
    .filter((s) => s.is_active !== false) // Filter out inactive suppliers
    .map((s) => ({
      label: s.name || s.supplier_code,
      value: s.id,
    }));

  return (
    <Select
      value={value}
      onChange={onChange}
      options={options}
      placeholder={def.help_text || "Select Supplier"}
      style={{ width: "100%" }}
      showSearch
      filterOption={(input, option) =>
        (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
      }
      notFoundContent={loading ? <Spin size="small" /> : "No suppliers found"}
      loading={loading}
    />
  );
}
