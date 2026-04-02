import React, { useState } from "react";
import i18n from "@/locale/i18n";
import { ScrollView } from "react-native";
import { Drawer, DrawerButton, SectionContainer } from "@/components/sea-saw-page/base";
import DisplayForm from "@/components/sea-saw-design/form/DisplayForm";
import RoleFormInput from "../input/RoleFormInput";

interface RoleDisplayProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate?: (res: any) => void;
  onUpdate?: (res: any) => void;
  def?: any[];
  data?: Record<string, any> | null;
  columnOrder?: string[];
}

export default function RoleDisplay({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  def = [],
  data,
  columnOrder,
}: RoleDisplayProps) {
  const role = data ?? {};
  const [editingRole, setEditingRole] = useState<any | null>(null);

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title={i18n.t("Role Details")}
      footer={
        <DrawerButton
          onClose={onClose}
          onEdit={() => setEditingRole(role)}
        />
      }
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <SectionContainer>
          <DisplayForm def={def} data={role} columnOrder={columnOrder} />
        </SectionContainer>
        <RoleFormInput
          isOpen={Boolean(editingRole)}
          def={def}
          data={editingRole ?? {}}
          onClose={() => setEditingRole(null)}
          onCreate={onCreate}
          onUpdate={onUpdate}
          columnOrder={columnOrder}
        />
      </ScrollView>
    </Drawer>
  );
}
