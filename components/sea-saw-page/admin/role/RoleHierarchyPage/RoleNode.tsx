import React from "react";
import { Button, Tag, Tooltip, Popconfirm, Space, Typography } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import i18n from "@/locale/i18n";
import { ROLE_TYPE_COLOR, ROLE_TYPE_LABEL, type RoleData } from "./types";

const { Text } = Typography;

interface RoleNodeProps {
  role: RoleData;
  onAddChild: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function RoleNode({ role, onAddChild, onEdit, onDelete }: RoleNodeProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "3px 4px",
        minWidth: 320,
        maxWidth: 640,
      }}
    >
      <span style={{ fontWeight: 500, fontSize: 14, minWidth: 100 }}>
        {role.role_name}
      </span>

      <Tag color={ROLE_TYPE_COLOR[role.role_type] ?? "default"} style={{ margin: 0 }}>
        {ROLE_TYPE_LABEL[role.role_type] ?? role.role_type}
      </Tag>

      <Tooltip
        title={
          role.is_peer_visible
            ? "同级可见：同一角色的用户可以互相查看数据"
            : "同级不可见：同一角色的用户无法查看彼此的数据"
        }
      >
        {role.is_peer_visible ? (
          <EyeOutlined style={{ color: "#52c41a", fontSize: 13 }} />
        ) : (
          <EyeInvisibleOutlined style={{ color: "#bfbfbf", fontSize: 13 }} />
        )}
      </Tooltip>

      {role.description && (
        <Text type="secondary" style={{ fontSize: 12, flex: 1 }} ellipsis>
          {role.description}
        </Text>
      )}

      <Space size={0} style={{ marginLeft: "auto", flexShrink: 0 }}>
        <Tooltip title={i18n.t("Create Role") + " (sub)"}>
          <Button
            size="small"
            type="text"
            icon={<PlusOutlined style={{ fontSize: 11 }} />}
            onClick={e => { e.stopPropagation(); onAddChild(); }}
          />
        </Tooltip>
        <Tooltip title={i18n.t("Edit Role")}>
          <Button
            size="small"
            type="text"
            icon={<EditOutlined style={{ fontSize: 11 }} />}
            onClick={e => { e.stopPropagation(); onEdit(); }}
          />
        </Tooltip>
        <Popconfirm
          title={`删除角色 "${role.role_name}"？`}
          description="子角色的上级将被清空，已分配该角色的用户不受影响。"
          onConfirm={e => { e?.stopPropagation(); onDelete(); }}
          okButtonProps={{ danger: true }}
          okText="删除"
          cancelText="取消"
        >
          <Button
            size="small"
            type="text"
            danger
            icon={<DeleteOutlined style={{ fontSize: 11 }} />}
            onClick={e => e.stopPropagation()}
          />
        </Popconfirm>
      </Space>
    </div>
  );
}
