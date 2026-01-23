import React, { useMemo, useRef } from "react";
import i18n from '@/locale/i18n';
import { View, ScrollView } from "react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import Drawer from "./base/Drawer.web";

import DisplayForm from "@/components/sea-saw-design/form/DisplayForm";
import OrderDisplay from "./OrderDisplay";
import ContactDisplay from "./ContactDisplay";
import EmptySlot from "./base/EmptySlot";

interface ContractDisplayProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (data: any) => void;
  def?: any[];
  data?: Record<string, any> | null;
}

export default function ContractDisplay({
  isOpen,
  onClose,
  onEdit,
  def = [],
  data,
}: ContractDisplayProps) {
  const parentNodeRef = useRef<any>(null);

  /** ==== 数据预处理 ==== */
  const safeData = data ?? {}; // 统一安全值
  const orders = safeData.orders ?? [];
  const baseData = { ...safeData, orders: undefined };

  /** ==== def 处理 ==== */
  const { ordersDef, baseDef } = useMemo(() => {
    return {
      ordersDef: def.find((item) => item.field === "orders"),
      baseDef: def.filter((item) => item.field !== "orders"),
    };
  }, [def]);

  /** ==== 注入 Contact 自定义显示器 ==== */
  const config = useMemo(
    () => ({
      contact: {
        render: (f: any, v: any) => (
          <ContactDisplay
            def={f}
            value={v}
            parentNode={parentNodeRef.current}
          />
        ),
      },
    }),
    []
  );

  /** ==== Footer ==== */
  const footer = (
    <View className="flex flex-row justify-end gap-1 p-1">
      {onEdit && (
        <Button className="py-1 px-4" onPress={() => onEdit(safeData)}>
          <Text className="text-white">{i18n.t("Edit")}</Text>
        </Button>
      )}

      <Button variant="outline" className="py-1 px-4" onPress={onClose}>
        <Text>{i18n.t("Close")}</Text>
      </Button>
    </View>
  );

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title={i18n.t("Contract Details")}
      footer={footer}
    >
      {/* Body */}
      <ScrollView
        ref={parentNodeRef}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 基础信息 */}
        <View>
          <Text className="text-sm font-semibold mb-2">
            {i18n.t("contract infomation")}
          </Text>

          <DisplayForm
            table="contract"
            def={baseDef}
            data={baseData}
            config={config}
            className="rounded-lg border border-gray-100"
          />
        </View>

        {/* 订单信息 */}
        <View className="mt-6">
          <Text className="text-sm font-semibold mb-2">{i18n.t("order")}</Text>

          {orders.length > 0 ? (
            <View className="space-y-2">
              {orders.map((item: any, idx: number) => (
                <OrderDisplay
                  key={`${item?.pk ?? idx}`}
                  def={ordersDef}
                  value={item}
                />
              ))}
            </View>
          ) : (
            <EmptySlot message={i18n.t("No order information")} />
          )}
        </View>
      </ScrollView>
    </Drawer>
  );
}
