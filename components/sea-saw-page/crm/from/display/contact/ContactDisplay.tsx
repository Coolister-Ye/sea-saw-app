import React, { useState, useRef } from "react";
import i18n from "@/locale/i18n";
import { View, ScrollView } from "react-native";
import { Button } from "antd";
import Drawer from "../../base/Drawer.web";
import Section from "../../base/Section";
import { ContactFormInput } from "../../input/contact";
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
  const parentNodeRef = useRef<any>(null);

  const contact = data ?? {};

  /* ========================
   * Editing state
   * ======================== */
  const [editingContact, setEditingContact] = useState<any | null>(null);

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title={i18n.t("Contact Details")}
      footer={
        <View className="flex-row justify-end p-2 gap-1">
          <Button onClick={onClose}>{i18n.t("Close")}</Button>
          <Button type="primary" onClick={() => setEditingContact(contact)}>
            {i18n.t("Edit")}
          </Button>
        </View>
      }
    >
      <ScrollView
        ref={parentNodeRef}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ================= Contact Information ================= */}
        <Section
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
        </Section>
      </ScrollView>
    </Drawer>
  );
}
