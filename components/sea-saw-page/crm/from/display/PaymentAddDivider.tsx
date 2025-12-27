import React from "react";
import { Divider, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import clsx from "clsx";
import { useLocale } from "@/context/Locale";

interface PaymentAddDividerProps {
  disabled?: boolean;
  onAdd: () => void;
}

export default function PaymentAddDivider({
  disabled,
  onAdd,
}: PaymentAddDividerProps) {
  const { i18n } = useLocale();
  return (
    <Divider dashed>
      <Button
        type="link"
        className={clsx(
          "flex items-center justify-center gap-1 text-sm cursor-pointer select-none",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => {
          if (!disabled) onAdd();
        }}
      >
        <PlusOutlined />
        {i18n.t("Create Payment")}
      </Button>
    </Divider>
  );
}
