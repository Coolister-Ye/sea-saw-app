import React, { useMemo } from "react";
import { Popover, Button } from "antd";
import { BuildingOfficeIcon } from "react-native-heroicons/outline";

import { PopoverCard } from "@/components/sea-saw-page/base/popover";

interface Account {
  id?: string | number;
  pk?: string | number;
  account_name: string;
  address?: string;
  roles?: string[];
}

interface AccountPopoverProps {
  def?: Record<string, any>;
  value?: Account | null;
}

export default function AccountPopover({ value, def }: AccountPopoverProps) {
  const content = useMemo(
    () =>
      value ? (
        <PopoverCard
          headerIcon={
            <BuildingOfficeIcon size={16} className="text-blue-600" />
          }
          headerTitle={value.account_name}
          value={value}
          metaDef={def}
          columnOrder={["address", "roles"]}
          colDef={{ address: { icon: "📍" }, roles: { icon: "👤" } }}
        />
      ) : null,
    [value, def],
  );

  if (!value) {
    return (
      <Button
        type="link"
        disabled
        style={{
          padding: 0,
          height: "auto",
          lineHeight: "inherit",
          cursor: "default",
        }}
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
      placement="right"
      mouseEnterDelay={0.15}
    >
      <Button
        type="link"
        tabIndex={0}
        style={{
          padding: 0,
          height: "auto",
          lineHeight: "inherit",
        }}
        className="text-blue-600 hover:text-blue-700"
      >
        {value.account_name}
      </Button>
    </Popover>
  );
}
