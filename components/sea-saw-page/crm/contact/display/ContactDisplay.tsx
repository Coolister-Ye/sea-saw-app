import React, { useState } from "react";
import i18n from "@/locale/i18n";
import { ScrollView } from "react-native";
import { Drawer, DrawerButton, SectionContainer } from "@/components/sea-saw-page/base";
import { ContactFormInput } from "../input";
import ContactCard from "./ContactCard";

interface ContactDisplayProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate?: (res: any) => void;
  onUpdate?: (res: any) => void;
  def?: any[];
  data?: Record<string, any> | null;
}

export default function ContactDisplay({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  def = [],
  data,
}: ContactDisplayProps) {
  const contact = data ?? {};
  const [editingContact, setEditingContact] = useState<any | null>(null);

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title={i18n.t("Contact Details")}
      footer={
        <DrawerButton
          onClose={onClose}
          onEdit={() => setEditingContact(contact)}
        />
      }
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <SectionContainer
          title={i18n.t("Contact Information")}
          contentClassName="border-gray-200"
        >
          <ContactCard
            def={def}
            data={contact}
            onEdit={() => setEditingContact(contact)}
          />
          <ContactFormInput
            isOpen={Boolean(editingContact)}
            def={def}
            data={editingContact ?? {}}
            onClose={() => {
              setEditingContact(null);
            }}
            onCreate={onCreate}
            onUpdate={onUpdate}
          />
        </SectionContainer>
      </ScrollView>
    </Drawer>
  );
}
