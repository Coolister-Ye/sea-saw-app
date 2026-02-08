import React, { useMemo } from "react";
import { Popover, Button } from "antd";
import { UserIcon } from "react-native-heroicons/outline";

import { Text } from "@/components/sea-saw-design/text";
import { PopoverCard } from "@/components/sea-saw-page/base/popover";

interface Contact {
  id?: string | number;
  name: string;
  title?: string;
  email?: string;
  mobile?: string;
  phone?: string;
  company?: {
    company_name?: string;
  };
}

interface ContactPopoverProps {
  def?: Record<string, any>;
  value?: Contact | null;
}

export default function ContactPopover({ value, def }: ContactPopoverProps) {
  const content = useMemo(
    () =>
      value ? (
        <PopoverCard
          headerIcon={<UserIcon size={16} className="text-blue-600" />}
          headerTitle={value.name}
          value={value}
          metaDef={def}
          columnOrder={["title", "email", "mobile", "phone"]}
        />
      ) : null,
    [value, def],
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
        style={{
          padding: 0,
          height: "auto",
          lineHeight: "inherit",
        }}
        className="text-blue-600 hover:text-blue-700"
      >
        {value.name}
      </Button>
    </Popover>
  );
}
