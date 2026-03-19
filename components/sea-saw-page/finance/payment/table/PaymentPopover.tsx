import React, { useMemo } from "react";
import { BanknotesIcon } from "react-native-heroicons/outline";
import { Popover, Button } from "antd";

import { Text } from "@/components/sea-saw-design/text";
import { PopoverCard } from "@/components/sea-saw-page/base/popover";
import PaymentTypeTag from "@/components/sea-saw-page/finance/payment/display/PaymentTypeTag";

interface PaymentPopoverProps {
  value?: Record<string, any> | null;
  def?: Record<string, any>;
}

export default function PaymentPopover({ value, def }: PaymentPopoverProps) {
  const displayCode =
    value?.payment_code ?? `Payment #${value?.id ?? value?.pk}`;

  const content = useMemo(
    () =>
      value ? (
        <PopoverCard
          headerIcon={<BanknotesIcon size={16} className="text-blue-600" />}
          headerTitle={displayCode}
          value={value}
          metaDef={def}
          columnOrder={["payment_type", "amount", "currency", "payment_date"]}
          iconBgClass="bg-blue-50"
          colDef={{
            payment_type: {
              render: (fieldDef, fieldValue) => (
                <PaymentTypeTag value={fieldValue} def={fieldDef} />
              ),
            },
          }}
        />
      ) : null,
    [value, def, displayCode],
  );

  if (!value) {
    return <Text>-</Text>;
  }

  return (
    <Popover
      content={content}
      trigger="hover"
      placement="right"
      mouseEnterDelay={0.15}
    >
      <Button
        type="link"
        tabIndex={0}
        style={{ padding: 0, height: "auto", lineHeight: "inherit" }}
        className="text-blue-600 hover:text-blue-700"
      >
        {displayCode}
      </Button>
    </Popover>
  );
}

export { PaymentPopover };
