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
  /** Custom trigger element. Defaults to a link button showing account_name. */
  children?: React.ReactNode;
  /** Override popup container, e.g. to fix z-index inside modals */
  getPopupContainer?: (trigger: HTMLElement) => HTMLElement;
}

const COL_DEF = {
  address: { icon: "📍" },
  email:   { icon: "✉️" },
  phone:   { icon: "📞" },
};

export default function AccountPopover({ value, def, children, getPopupContainer }: AccountPopoverProps) {
  const content = useMemo(
    () =>
      value ? (
        <PopoverCard
          headerIcon={<BuildingOfficeIcon size={16} className="text-blue-600" />}
          headerTitle={value.account_name}
          value={value}
          metaDef={def}
          columnOrder={["address", "email", "phone"]}
          colDef={COL_DEF}
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
    <Popover content={content} trigger="hover" placement="right" mouseEnterDelay={0.15} getPopupContainer={getPopupContainer}>
      {children ?? (
        <Button
          type="link"
          tabIndex={0}
          style={{ padding: 0, height: "auto", lineHeight: "inherit" }}
          className="text-blue-600 hover:text-blue-700"
        >
          {value.account_name}
        </Button>
      )}
    </Popover>
  );
}
