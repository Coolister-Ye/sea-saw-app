import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { Button } from "antd";
import { FilterOutlined, ReloadOutlined } from "@ant-design/icons";
import type { FormInstance } from "antd";
import i18n from "@/locale/i18n";
import { SearchForm } from "@/components/sea-saw-design/form/SearchForm";
import type { HeaderMetaProps } from "@/components/sea-saw-design/table/interface";
import AccountSelector from "@/components/sea-saw-page/crm/account/input/AccountSelector";
import { ContactSelector } from "@/components/sea-saw-page/crm/contact/input";

type PipelineSearchProps = {
  form: FormInstance;
  metadata: Record<string, HeaderMetaProps>;
  onFinish: (filterParams: Record<string, any>) => void;
  onReset: () => void;
};

export function PipelineSearch({
  form,
  metadata,
  onFinish,
  onReset,
}: PipelineSearchProps) {
  const config = useMemo(
    () => ({
      account: {
        read_only: false,
        render: (_col: any, meta: any) => <AccountSelector def={meta} />,
        skipFilter: true,
      },
      account_id: { hidden: true },
      contact: {
        read_only: false,
        render: (_col: any, meta: any) => <ContactSelector def={meta} />,
        skipFilter: true,
      },
      contact_id: { hidden: true },
    }),
    [],
  );

  return (
    <View className="w-[220px] lg:w-[260px] xl:w-[300px] flex-col border-r border-[#f0f0f0]">
      <View className="flex-row items-center gap-1.5 px-3 py-2.5 border-b border-[#f0f0f0] bg-[#fafafa]">
        <FilterOutlined style={{ fontSize: 12, color: "#8c8c8c" }} />
        <Text className="font-medium text-[#595959]">{i18n.t("filter")}</Text>
      </View>

      <View className="flex-1">
        <SearchForm
          form={form}
          metadata={metadata}
          layout="vertical"
          onFinish={onFinish}
          config={config}
        />
      </View>

      <View className="flex-row gap-2 p-3 border-t border-[#f0f0f0] bg-[#fafafa]">
        <Button
          type="primary"
          onClick={() => form.submit()}
          style={{ flex: 1 }}
        >
          {i18n.t("search")}
        </Button>
        <Button icon={<ReloadOutlined />} onClick={onReset} style={{ flex: 1 }}>
          {i18n.t("reset")}
        </Button>
      </View>
    </View>
  );
}

export default PipelineSearch;
