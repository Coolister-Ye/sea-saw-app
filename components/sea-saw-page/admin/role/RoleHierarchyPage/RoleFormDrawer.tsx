import React from "react";
import {
  Button,
  Drawer,
  Form,
  Input,
  Select,
  Switch,
} from "antd";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import i18n from "@/locale/i18n";
import { ROLE_TYPE_OPTIONS, type RoleData } from "./types";

const { TextArea } = Input;

interface RoleFormDrawerProps {
  open: boolean;
  editingRole: RoleData | null;
  parentOptions: { label: string; value: number }[];
  saving: boolean;
  form: ReturnType<typeof Form.useForm>[0];
  onClose: () => void;
  onSave: () => void;
}

export function RoleFormDrawer({
  open,
  editingRole,
  parentOptions,
  saving,
  form,
  onClose,
  onSave,
}: RoleFormDrawerProps) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={editingRole ? i18n.t("Edit Role") : i18n.t("Create Role")}
      width={460}
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button onClick={onClose}>{i18n.t("Close")}</Button>
          <Button type="primary" loading={saving} onClick={onSave}>
            Save
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical" requiredMark="optional">
        <Form.Item
          name="role_name"
          label="角色名称"
          rules={[{ required: true, message: "请输入角色名称" }]}
        >
          <Input placeholder="例：销售经理" />
        </Form.Item>

        <Form.Item name="role_type" label="角色类型">
          <Select options={ROLE_TYPE_OPTIONS} placeholder="选择类型" />
        </Form.Item>

        <Form.Item
          name="parent"
          label="上级角色"
          extra="不设置则为根角色，根角色之间相互独立"
        >
          <Select
            allowClear
            showSearch
            options={parentOptions}
            placeholder="无（根角色）"
            filterOption={(input, opt) =>
              String(opt?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>

        <Form.Item
          name="is_peer_visible"
          label="同级可见"
          valuePropName="checked"
          extra="开启后，同一角色的用户可以互相查看彼此的数据"
        >
          <Switch
            checkedChildren={<EyeOutlined />}
            unCheckedChildren={<EyeInvisibleOutlined />}
          />
        </Form.Item>

        <Form.Item name="description" label="描述（可选）">
          <TextArea rows={3} placeholder="角色的职责说明..." />
        </Form.Item>
      </Form>
    </Drawer>
  );
}
