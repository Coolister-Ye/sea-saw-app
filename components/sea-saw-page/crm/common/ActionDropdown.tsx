import React from "react";
import { Dropdown, MenuProps, Button, Space } from "antd";
import { EllipsisOutlined } from "@ant-design/icons";
import { View } from "react-native";
import { useLocale } from "@/context/Locale";

interface Props {
  openCreate: () => void;
  openCopy: () => void;
  copyDisabled: boolean;
}

export default function ActionDropdown({
  openCreate,
  openCopy,
  copyDisabled,
}: Props) {
  const { i18n } = useLocale();

  const menuProps: MenuProps = {
    items: [
      {
        label: i18n.t("copy"),
        key: "copy",
        disabled: copyDisabled,
      },
    ],
    onClick: ({ key }) => {
      if (key === "copy" && !copyDisabled) {
        openCopy();
      }
    },
  };

  return (
    <Space.Compact>
      <Button type="primary" onClick={openCreate}>
        {i18n.t("create")}
      </Button>

      <Dropdown menu={menuProps} placement="bottomRight">
        <Button
          type="primary"
          icon={<EllipsisOutlined />}
          disabled={copyDisabled}
        />
      </Dropdown>
    </Space.Compact>
  );
}
