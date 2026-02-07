import React, { useState } from "react";
import i18n from "@/locale/i18n";
import { ScrollView } from "react-native";
import { Drawer, DrawerButton, SectionContainer } from "@/components/sea-saw-page/base";
import AccountFormInput from "../input/AccountFormInput";
import AccountCard from "./AccountCard";

interface AccountDisplayProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate?: (res: any) => void;
  onUpdate?: (res: any) => void;
  def?: any[];
  data?: Record<string, any> | null;
  columnOrder?: string[];
}

export default function AccountDisplay({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  def = [],
  data,
  columnOrder,
}: AccountDisplayProps) {
  const account = data ?? {};
  const [editingAccount, setEditingAccount] = useState<any | null>(null);

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title={i18n.t("Account Details")}
      footer={
        <DrawerButton
          onClose={onClose}
          onEdit={() => setEditingAccount(account)}
        />
      }
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <SectionContainer
          title={i18n.t("Account Information")}
          contentClassName="border-gray-200"
        >
          <AccountCard
            def={def}
            data={account}
            onEdit={() => setEditingAccount(account)}
            columnOrder={columnOrder}
          />
          <AccountFormInput
            isOpen={Boolean(editingAccount)}
            def={def}
            data={editingAccount ?? {}}
            onClose={() => {
              setEditingAccount(null);
            }}
            onCreate={onCreate}
            onUpdate={onUpdate}
            columnOrder={columnOrder}
          />
        </SectionContainer>
      </ScrollView>
    </Drawer>
  );
}
