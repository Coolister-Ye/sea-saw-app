import React, { useState, useRef } from "react";
import i18n from "@/locale/i18n";
import { View, ScrollView } from "react-native";
import { Button } from "antd";
import Drawer from "../../base/Drawer.web";
import Section from "../../base/Section";
import { CompanyFormInput } from "../../input/company";
import CompanyCard from "./CompanyCard";

interface CompanyDisplayProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate?: (res: any) => void;
  onUpdate?: (res: any) => void;
  def?: any[];
  data?: Record<string, any> | null;
}

export default function CompanyDisplay({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  def = [],
  data,
}: CompanyDisplayProps) {
  const parentNodeRef = useRef<any>(null);

  const company = data ?? {};

  /* ========================
   * Editing state
   * ======================== */
  const [editingCompany, setEditingCompany] = useState<any | null>(null);

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title={i18n.t("Company Details")}
      footer={
        <View className="flex-row justify-end p-2 gap-1">
          <Button onClick={onClose}>{i18n.t("Close")}</Button>
          <Button type="primary" onClick={() => setEditingCompany(company)}>
            {i18n.t("Edit")}
          </Button>
        </View>
      }
    >
      <ScrollView
        ref={parentNodeRef}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ================= Company Information ================= */}
        <Section
          title={i18n.t("Company Information")}
          contentClassName="border-gray-200"
        >
          <CompanyCard
            def={def}
            data={company}
            onEdit={() => setEditingCompany(company)}
          />
          <CompanyFormInput
            isOpen={Boolean(editingCompany)}
            def={def}
            data={editingCompany ?? {}}
            onClose={() => {
              setEditingCompany(null);
            }}
            onCreate={onCreate}
            onUpdate={onUpdate}
          />
        </Section>
      </ScrollView>
    </Drawer>
  );
}
