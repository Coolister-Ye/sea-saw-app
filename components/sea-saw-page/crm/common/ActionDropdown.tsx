import React from "react";
import { Dropdown, MenuProps, Button, Space } from "antd";
import { EllipsisOutlined } from "@ant-design/icons";
import { View } from "react-native";
import { useLocale } from "@/context/Locale";

interface Props {
  openCreate: () => void;
  openCopy: () => void;
  openDelete?: () => void;
  copyDisabled: boolean;
  deleteDisabled?: boolean;
}

export default function ActionDropdown({
  openCreate,
  openCopy,
  openDelete,
  copyDisabled,
  deleteDisabled = true,
}: Props) {
  const { i18n } = useLocale();

  const menuProps: MenuProps = {
    items: [
      {
        label: i18n.t("copy"),
        key: "copy",
        disabled: copyDisabled,
      },
      {
        type: "divider",
      },
      {
        label: i18n.t("Delete"),
        key: "delete",
        disabled: deleteDisabled,
        danger: true,
      },
    ],
    onClick: ({ key }) => {
      if (key === "copy" && !copyDisabled) {
        openCopy();
      } else if (key === "delete" && !deleteDisabled && openDelete) {
        openDelete();
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
          disabled={copyDisabled && deleteDisabled}
        />
      </Dropdown>
    </Space.Compact>
  );
}
