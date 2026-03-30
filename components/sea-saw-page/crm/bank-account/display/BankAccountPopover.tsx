import React, { useMemo } from "react";
import { Popover, Button } from "antd";
import { BuildingLibraryIcon } from "react-native-heroicons/outline";

import { PopoverCard } from "@/components/sea-saw-page/base/popover";

interface BankAccount {
  id?: string | number;
  bank_name?: string;
  account_number?: string;
  account_holder?: string;
  currency?: string;
  is_primary?: boolean;
}

interface BankAccountPopoverProps {
  def?: Record<string, any>;
  value?: BankAccount | null;
  placement?: "right" | "left" | "top" | "bottom" | "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
}

export default function BankAccountPopover({
  value,
  def,
  placement = "right",
}: BankAccountPopoverProps) {
  const content = useMemo(
    () =>
      value ? (
        <PopoverCard
          headerIcon={<BuildingLibraryIcon size={16} className="text-blue-600" />}
          headerTitle={value.bank_name ?? "—"}
          value={value}
          metaDef={def}
          columnOrder={["account_number", "account_holder", "currency"]}
        />
      ) : null,
    [value, def],
  );

  if (!value) {
    return (
      <Button
        type="link"
        disabled
        style={{ padding: 0, height: "auto", lineHeight: "inherit", cursor: "default" }}
        className="text-slate-400"
      >
        -
      </Button>
    );
  }

  return (
    <Popover
      content={content}
      trigger="hover"
      placement={placement}
      mouseEnterDelay={0.15}
    >
      <Button
        type="link"
        tabIndex={0}
        style={{ padding: 0, height: "auto", lineHeight: "inherit" }}
        className="text-blue-600 hover:text-blue-700"
      >
        {value.bank_name}
      </Button>
    </Popover>
  );
}
