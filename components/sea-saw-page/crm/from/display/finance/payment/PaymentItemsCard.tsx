import React, { useMemo } from "react";
import { View, Linking } from "react-native";
import { Text } from "@/components/ui/text";
import { Button } from "antd";
import { PencilSquareIcon } from "react-native-heroicons/outline";
import { getFieldLabelMap } from "@/utils";
import { formatNumberTrim } from "@/utils";
import { useLocale } from "@/context/Locale";
import EmptySlot from "../../../base/EmptySlot";
import InfoField from "../../../base/InfoField";
import InfoSection from "../../../base/InfoSection";
import ItemCard from "../../../base/ItemCard";
import AttachmentsDisplay from "../../shared/AttachmentsDisplay";

interface PaymentItemsCardProps {
  def?: any;
  value?: any[] | null;
  onItemClick?: (index: number) => void;
  orderStatus?: string;
}

export default function PaymentItemsCard({
  def,
  value,
  onItemClick,
  orderStatus,
}: PaymentItemsCardProps) {
  const { i18n } = useLocale();

  const fieldLabelMap = useMemo(
    () => getFieldLabelMap(def?.child?.children ?? {}),
    [def]
  );

  const getLabel = (field: string, fallback?: string) =>
    fieldLabelMap[field] ?? (fallback ? i18n.t?.(fallback) ?? fallback : field);

  const clickable = typeof onItemClick === "function";
  const isCompleted = orderStatus === "completed";

  if (!value?.length) {
    return <EmptySlot message={i18n.t("No payment records")} />;
  }

  return (
    <View className="space-y-4 w-full">
      {value.map((item, index) => {
        const currency = item.currency || "USD";

        return (
          <ItemCard key={item.id ?? index} clickable={false}>
            {/* ================= Header ================= */}
            <View className="flex-row justify-between items-start mb-3">
              {/* 左侧：标题 + 日期 */}
              <View className="flex-1 pr-3">
                <Text className="text-base font-semibold text-gray-900">
                  {item.payment_code || i18n.t("Payment")}
                </Text>

                {item.payment_date && (
                  <Text className="text-sm text-gray-600 mt-1">
                    {item.payment_date}
                  </Text>
                )}
              </View>

              {/* 右侧：金额 + Edit */}
              <View className="items-end gap-1">
                <Text className="text-lg font-bold text-green-700">
                  {formatNumberTrim(item.amount, 2)} {currency}
                </Text>

                {clickable && !isCompleted && (
                  <Button
                    type="text"
                    size="small"
                    className="p-0"
                    onClick={() => onItemClick(index)}
                    icon={
                      <PencilSquareIcon size={16} className="text-gray-500" />
                    }
                  />
                )}
              </View>
            </View>

            {/* ================= Payment Details ================= */}
            <InfoSection title={i18n.t("Payment Details")}>
              <View className="flex-row gap-4 flex-wrap">
                <InfoField
                  label={getLabel("payment_method", "Payment Method")}
                  value={item.payment_method}
                />
                <InfoField
                  label={getLabel("currency", "Currency")}
                  value={item.currency}
                />
                <InfoField
                  label={getLabel("bank_reference", "Bank Reference")}
                  value={item.bank_reference}
                />
              </View>
            </InfoSection>

            {/* ================= Additional Information ================= */}
            {(item.remark ||
              item.attachment ||
              item.attachments?.length > 0) && (
              <InfoSection title={i18n.t("Additional Information")}>
                <View className="flex-row gap-4 flex-wrap">
                  {item.remark && (
                    <View className="flex-1 min-w-full">
                      <InfoField
                        label={getLabel("remark", "Remark")}
                        value={item.remark}
                      />
                    </View>
                  )}

                  {/* New attachments array */}
                  {item.attachments?.length > 0 && (
                    <View className="flex-1 min-w-full">
                      <InfoField label={getLabel("attachments", "Attachments")}>
                        <AttachmentsDisplay value={item.attachments} />
                      </InfoField>
                    </View>
                  )}
                </View>
              </InfoSection>
            )}
          </ItemCard>
        );
      })}
    </View>
  );
}
