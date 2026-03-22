import React, { useState } from "react";
import i18n from "@/locale/i18n";
import { ScrollView } from "react-native";
import {
  Drawer,
  DrawerButton,
  SectionContainer,
} from "@/components/sea-saw-page/base";
import BankAccountFormInput from "../input/BankAccountFormInput";
import BankAccountCard from "./BankAccountCard";

interface BankAccountDisplayProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate?: (res: any) => void;
  onUpdate?: (res: any) => void;
  def?: any[];
  data?: Record<string, any> | null;
}

export default function BankAccountDisplay({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  def = [],
  data,
}: BankAccountDisplayProps) {
  const bankAccount = data ?? {};
  const [editingRecord, setEditingRecord] = useState<any | null>(null);

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title={i18n.t("Bank Account Details")}
      footer={
        <DrawerButton
          onClose={onClose}
          onEdit={() => setEditingRecord(bankAccount)}
        />
      }
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <SectionContainer contentClassName="border-none">
          <BankAccountCard
            def={def}
            data={bankAccount}
            onEdit={() => setEditingRecord(bankAccount)}
          />
          <BankAccountFormInput
            isOpen={Boolean(editingRecord)}
            def={def}
            data={editingRecord ?? {}}
            onClose={() => setEditingRecord(null)}
            onCreate={onCreate}
            onUpdate={onUpdate}
          />
        </SectionContainer>
      </ScrollView>
    </Drawer>
  );
}
