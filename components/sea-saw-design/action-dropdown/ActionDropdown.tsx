import React, { useMemo } from "react";
import i18n from '@/locale/i18n';
import { Dropdown, Button, Space } from "antd";
import type { MenuProps } from "antd";
import { EllipsisOutlined } from "@ant-design/icons";
export interface ActionDropdownProps {
  /** Handler for the primary create action */
  onPrimaryAction: () => void;
  /** Label for the primary button (defaults to i18n "create") */
  primaryLabel?: string;
  /** Handler for copy action */
  onCopy?: () => void;
  /** Handler for delete action */
  onDelete?: () => void;
  /** Whether copy action is disabled */
  copyDisabled?: boolean;
  /** Whether delete action is disabled */
  deleteDisabled?: boolean;
}

export function ActionDropdown({
  onPrimaryAction,
  primaryLabel,
  onCopy,
  onDelete,
  copyDisabled = false,
  deleteDisabled = true,
}: ActionDropdownProps) {
  const menuItems: MenuProps["items"] = useMemo(() => {
    const items: MenuProps["items"] = [];

    if (onCopy) {
      items.push({
        label: i18n.t("copy"),
        key: "copy",
        disabled: copyDisabled,
      });
    }

    if (onCopy && onDelete) {
      items.push({ type: "divider" });
    }

    if (onDelete) {
      items.push({
        label: i18n.t("Delete"),
        key: "delete",
        disabled: deleteDisabled,
        danger: true,
      });
    }

    return items;
  }, [i18n, onCopy, onDelete, copyDisabled, deleteDisabled]);

  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "copy" && !copyDisabled && onCopy) {
      onCopy();
    } else if (key === "delete" && !deleteDisabled && onDelete) {
      onDelete();
    }
  };

  const allDisabled = copyDisabled && deleteDisabled;
  const hasDropdownItems = onCopy || onDelete;

  return (
    <Space.Compact>
      <Button type="primary" onClick={onPrimaryAction}>
        {primaryLabel ?? i18n.t("create")}
      </Button>

      {hasDropdownItems && (
        <Dropdown
          menu={{ items: menuItems, onClick: handleMenuClick }}
          placement="bottomRight"
        >
          <Button
            type="primary"
            icon={<EllipsisOutlined />}
            disabled={allDisabled}
          />
        </Dropdown>
      )}
    </Space.Compact>
  );
}

export default ActionDropdown;
