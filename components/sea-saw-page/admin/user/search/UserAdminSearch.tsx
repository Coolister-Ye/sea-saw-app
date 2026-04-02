import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { Button } from "antd";
import { FilterOutlined, ReloadOutlined } from "@ant-design/icons";
import type { FormInstance } from "antd";
import i18n from "@/locale/i18n";
import { SearchForm } from "@/components/sea-saw-design/form/SearchForm";
import type { HeaderMetaProps } from "@/components/sea-saw-design/table/interface";

type UserAdminSearchProps = {
  form: FormInstance;
  metadata: Record<string, HeaderMetaProps>;
  onFinish: (filterParams: Record<string, any>) => void;
  onReset: () => void;
};

export function UserAdminSearch({
  form,
  metadata,
  onFinish,
  onReset,
}: UserAdminSearchProps) {
  // Hide write-only fields (password, role_id) and read-only nested role object from search
  const config = useMemo(
    () => ({
      password: { hidden: true },
      role_id: { hidden: true },
      role: { hidden: true },
      date_joined: { hidden: true },
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

export default UserAdminSearch;
