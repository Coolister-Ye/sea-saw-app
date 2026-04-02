/**
 * RoleHierarchyPage
 *
 * 以树状层级可视化展示角色结构，替代扁平表格。
 * 角色层级决定数据可见性：上级可查看下级数据。
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { View } from "react-native";
import { Button, Form, Space, Tag, Typography, Spin, Alert, message } from "antd";
import { PlusOutlined, EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { Tree } from "@/components/sea-saw-design/tree";
import i18n from "@/locale/i18n";
import useDataService from "@/hooks/useDataService";
import { devError } from "@/utils/logger";
import {
  toTreeData,
  ROLE_TYPE_COLOR,
  ROLE_TYPE_OPTIONS,
  type RoleData,
  type RoleTreeNode,
} from "./types";
import { RoleNode } from "./RoleNode";
import { RoleFormDrawer } from "./RoleFormDrawer";

const { Text, Title } = Typography;

export default function RoleHierarchyPage() {
  const { getViewSet } = useDataService();
  const roleViewSet = useMemo(() => getViewSet("adminRole"), [getViewSet]);

  const [roles, setRoles] = useState<RoleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleData | null>(null);
  const [saving, setSaving] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  /* ── Data fetching ── */

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await roleViewSet.list({ params: { page_size: 1000 } });
      const list: RoleData[] = res?.results ?? res ?? [];
      setRoles(list);
      setExpandedKeys(list.map(r => String(r.id)));
    } catch (err) {
      devError("Failed to load roles", err);
    } finally {
      setLoading(false);
    }
  }, [roleViewSet]);

  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  /* ── Computed ── */

  const treeData = useMemo(() => toTreeData(roles), [roles]);

  const parentOptions = useMemo(
    () =>
      roles
        .filter(r => r.id !== editingRole?.id)
        .map(r => ({ label: r.role_name, value: r.id })),
    [roles, editingRole],
  );

  /* ── Handlers ── */

  const openCreate = useCallback(
    (parentId: number | null = null) => {
      setEditingRole(null);
      form.resetFields();
      form.setFieldsValue({ parent: parentId ?? undefined, is_peer_visible: false, role_type: "UNKNOWN" });
      setFormOpen(true);
    },
    [form],
  );

  const openEdit = useCallback(
    (role: RoleData) => {
      setEditingRole(role);
      form.setFieldsValue({
        role_name: role.role_name,
        role_type: role.role_type,
        parent: role.parent ?? undefined,
        is_peer_visible: role.is_peer_visible,
        description: role.description,
      });
      setFormOpen(true);
    },
    [form],
  );

  const handleDelete = useCallback(
    async (role: RoleData) => {
      try {
        await roleViewSet.delete({ id: role.id });
        messageApi.success(`"${role.role_name}" 已删除`);
        fetchRoles();
      } catch (err: any) {
        devError("Delete role failed", err);
        messageApi.error(err?.message ?? i18n.t("Failed"));
      }
    },
    [roleViewSet, fetchRoles, messageApi],
  );

  const handleSave = async () => {
    try {
      setSaving(true);
      const values = await form.validateFields();
      if (values.parent === undefined) values.parent = null;
      if (editingRole) {
        await roleViewSet.update({ id: editingRole.id, body: values });
      } else {
        await roleViewSet.create({ body: values });
      }
      messageApi.success(i18n.t("save successfully"));
      setFormOpen(false);
      fetchRoles();
    } catch (err: any) {
      if (err?.errorFields) return;
      devError("Save role failed", err);
      messageApi.error(err?.message ?? i18n.t("Save failed, please try again"));
    } finally {
      setSaving(false);
    }
  };

  const titleRender = useCallback(
    (nodeData: RoleTreeNode) => (
      <RoleNode
        role={nodeData.role}
        onAddChild={() => openCreate(nodeData.role.id)}
        onEdit={() => openEdit(nodeData.role)}
        onDelete={() => handleDelete(nodeData.role)}
      />
    ),
    [openCreate, openEdit, handleDelete],
  );

  /* ── Render ── */

  return (
    <View className="flex-1 bg-white">
      {contextHolder}

      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-[#f0f0f0]">
        <View>
          <Title level={4} style={{ margin: 0 }}>{i18n.t("Role Management")}</Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            角色决定用户的数据可见范围，上级角色可查看所有下级角色的数据
          </Text>
        </View>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreate()}>
          {i18n.t("Create Role")}
        </Button>
      </View>

      {/* Legend */}
      <View className="flex-row items-center px-6 py-2 bg-[#fafafa] border-b border-[#f0f0f0] gap-4">
        <Space size={16} wrap>
          <Space size={4}>
            <EyeOutlined style={{ color: "#52c41a", fontSize: 12 }} />
            <Text style={{ fontSize: 12, color: "#595959" }}>同级可见</Text>
          </Space>
          <Space size={4}>
            <EyeInvisibleOutlined style={{ color: "#bfbfbf", fontSize: 12 }} />
            <Text style={{ fontSize: 12, color: "#595959" }}>同级不可见</Text>
          </Space>
          <span style={{ color: "#d9d9d9" }}>|</span>
          {ROLE_TYPE_OPTIONS.map(({ value, label }) => (
            <Tag key={value} color={ROLE_TYPE_COLOR[value]} style={{ margin: 0 }}>
              {label}
            </Tag>
          ))}
        </Space>
      </View>

      {/* Tree */}
      <View className="flex-1 p-6 web:overflow-auto">
        {loading ? (
          <View className="flex-1 items-center justify-center" style={{ minHeight: 200 }}>
            <Spin size="large" />
          </View>
        ) : roles.length === 0 ? (
          <Alert
            message="暂无角色"
            description="点击右上角「新建角色」创建第一个角色。"
            type="info"
            showIcon
          />
        ) : (
          <Tree
            treeData={treeData as any}
            titleRender={titleRender as any}
            expandedKeys={expandedKeys}
            onExpand={keys => setExpandedKeys(keys as string[])}
            selectable={false}
            blockNode
          />
        )}
      </View>

      <RoleFormDrawer
        open={formOpen}
        editingRole={editingRole}
        parentOptions={parentOptions}
        saving={saving}
        form={form}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
      />
    </View>
  );
}
