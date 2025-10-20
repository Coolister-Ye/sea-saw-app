import { useState, useEffect, useCallback } from "react";
import { View } from "react-native";
import Modal from "react-native-modal";
import { themeBalham } from "ag-grid-community";

import useDataService from "@/hooks/useDataService";
import Table from "@/components/sea-saw-design/table";
import Button from "@/components/themed/Button";
import ContractForm from "@/components/sea-saw-page/crm/from/Contract";
import ContractDisplay from "@/components/sea-saw-page/crm/from/ContractDisplay";
import { HeaderMetaProps } from "@/components/sea-saw-design/table/interface";
import { useLocale } from "@/context/Locale";
import { FormDef } from "@/hooks/useFormDefs";

export default function ContractScreen() {
  const { options } = useDataService();
  const { i18n } = useLocale();

  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "view">("create");
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [formDefs, setFormDefs] = useState<FormDef[]>([]);
  const [headerMeta, setHeaderMeta] = useState<Record<string, HeaderMetaProps>>(
    {}
  );

  const myTableTheme = themeBalham.withParams({
    columnBorder: { style: "solid" },
  });

  /** 从 headerMeta 生成 formDefs，供表单与展示使用 */
  const getFormDefFromHeaderMeta = useCallback(
    (def: Record<string, HeaderMetaProps>): FormDef[] =>
      Object.entries(def).map(([field, config]) => ({
        field,
        ...config,
      })),
    []
  );

  /** 从后端加载 meta 数据 */
  const fetchHeaderMeta = useCallback(async () => {
    try {
      const response = await options({ contentType: "contract" });
      if (!response.status) return;
      const meta: Record<string, HeaderMetaProps> =
        response.data.actions?.POST ?? {};
      setHeaderMeta(meta);
      setFormDefs(getFormDefFromHeaderMeta(meta));
    } catch (error) {
      console.error("Failed to load contract meta:", error);
    }
  }, [options, getFormDefFromHeaderMeta]);

  /** 页面加载时获取 headerMeta */
  useEffect(() => {
    fetchHeaderMeta();
  }, [fetchHeaderMeta]);

  /** 表格行点击时查看详情 */
  const handleRowClick = (rowData: any) => {
    setSelectedRow(rowData);
    setMode("view");
    setIsOpen(true);
  };

  /** 关闭弹窗 */
  const handleClose = () => {
    setIsOpen(false);
    setSelectedRow(null);
  };

  return (
    <View className="flex-1">
      {/* 顶部操作按钮 */}
      <View className="p-2">
        <Button
          variant="primary"
          className="w-fit p-2 text-xs"
          onPress={() => {
            setMode("create");
            setSelectedRow(null);
            setIsOpen(true);
          }}
        >
          {i18n.t("Create Contract")}
        </Button>
      </View>

      {/* 弹窗：创建 or 查看 */}
      <Modal
        isVisible={isOpen}
        animationIn="slideInRight"
        animationOut="slideOutRight"
        style={{ margin: 0 }}
        backdropOpacity={0.1}
        onBackdropPress={handleClose}
      >
        <View className="flex-1 relative">
          <View className="absolute inset-y-0 right-0 w-full sm:w-[600px] bg-gray-50 shadow-2xl rounded-l-2xl overflow-hidden">
            {mode === "create" ? (
              <ContractForm def={formDefs} onClose={handleClose} />
            ) : (
              <ContractDisplay
                def={formDefs}
                data={selectedRow}
                onClose={handleClose}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* 合同表格 */}
      <Table
        table="contract"
        headerMeta={headerMeta}
        theme={myTableTheme}
        onRowClicked={(event) => handleRowClick(event.data)}
      />
    </View>
  );
}
