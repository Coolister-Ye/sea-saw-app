import React, { useState, useMemo } from "react";
import i18n from "@/locale/i18n";
import { ScrollView } from "react-native";
import { message } from "antd";

import useDataService from "@/hooks/useDataService";
import { Drawer, DrawerButton, SectionContainer } from "@/components/sea-saw-page/base";
import DisplayForm from "@/components/sea-saw-design/form/DisplayForm";
import { Button } from "@/components/sea-saw-design/button";
import { devError } from "@/utils/logger";
import UserAdminFormInput from "../input/UserAdminFormInput";

interface UserAdminDisplayProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate?: (res: any) => void;
  onUpdate?: (res: any) => void;
  def?: any[];
  data?: Record<string, any> | null;
  columnOrder?: string[];
}

export default function UserAdminDisplay({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  def = [],
  data,
  columnOrder,
}: UserAdminDisplayProps) {
  const { request } = useDataService();
  const [messageApi, contextHolder] = message.useMessage();
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [toggling, setToggling] = useState(false);

  const user = data ?? {};
  const isActive = Boolean(user.is_active);

  const handleToggleActive = async () => {
    if (!user.id) return;
    try {
      setToggling(true);
      const res = await request({
        url: `/api/auth/admin/users/${user.id}/toggle-active/`,
        method: "POST",
      });
      messageApi.open({
        type: "success",
        content: isActive
          ? i18n.t("User disabled successfully")
          : i18n.t("User enabled successfully"),
      });
      onUpdate?.(res);
    } catch (err: any) {
      devError("Toggle active failed:", err);
      messageApi.open({
        type: "error",
        content: err?.message ?? i18n.t("Failed"),
      });
    } finally {
      setToggling(false);
    }
  };

  // Hide nested role object and write-only fields from display
  const config = useMemo(
    () => ({
      password: { hidden: true },
      role_id: { hidden: true },
    }),
    [],
  );

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title={i18n.t("User Details")}
      footer={
        <DrawerButton onClose={onClose} onEdit={() => setEditingUser(user)}>
          <Button
            type={isActive ? "default" : "primary"}
            onPress={handleToggleActive}
            disabled={toggling}
          >
            {isActive ? i18n.t("Disable User") : i18n.t("Enable User")}
          </Button>
        </DrawerButton>
      }
    >
      {contextHolder}
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <SectionContainer>
          <DisplayForm
            def={def}
            data={user}
            config={config}
            columnOrder={columnOrder}
          />
        </SectionContainer>
        <UserAdminFormInput
          isOpen={Boolean(editingUser)}
          def={def}
          data={editingUser ?? {}}
          onClose={() => setEditingUser(null)}
          onCreate={onCreate}
          onUpdate={onUpdate}
          columnOrder={columnOrder}
        />
      </ScrollView>
    </Drawer>
  );
}
